import type {
  Course,
  HistoryEntry,
  Scenario,
  Session,
  Settings,
  Sheet,
  Task,
  UserProfile,
} from "~/data/types";
import { contentFor } from "~/data/content";
import {
  scannedSheet,
  seedCourses,
  seedHistory,
  seedSettings,
  seedSheets,
  seedTasks,
  seedUser,
} from "~/data/seed";
import { contributionEntries, createSession, hasOpenGap, latestReview } from "~/domain/session";

export type TaskStatus = "new" | "inprogress" | "resolved" | "gaps";

interface AppState {
  version: number;
  signedIn: boolean;
  onboarded: boolean;
  user: UserProfile;
  settings: Settings;
  courses: Course[];
  sheets: Sheet[];
  tasks: Task[];
  sessions: Record<string, Session>;
  history: HistoryEntry[];
  scenario: Scenario;
  seenWelcomeTip: boolean;
}

const KEY = "attempt-first:v3";
const VERSION = 3;

function initial(): AppState {
  return {
    version: VERSION,
    signedIn: false,
    onboarded: false,
    user: structuredClone(seedUser),
    settings: structuredClone(seedSettings),
    courses: structuredClone(seedCourses),
    sheets: structuredClone(seedSheets),
    tasks: structuredClone(seedTasks),
    sessions: {},
    history: structuredClone(seedHistory),
    scenario: "issue",
    seenWelcomeTip: false,
  };
}

function load(): AppState {
  if (import.meta.server) return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === VERSION) {
        if (parsed.user.name === "Alex") parsed.user.name = seedUser.name;
        if (parsed.user.email === "alex.meier@student.example.edu") parsed.user.email = seedUser.email;
        return parsed;
      }
    }
  } catch {
    /* fall through to a fresh state */
  }
  return initial();
}

export function useApp() {
  const state = useState<AppState>("app", load);

  if (import.meta.client) {
    const wired = useState("app-persist", () => false);
    if (!wired.value) {
      wired.value = true;
      const flush = () => {
        try {
          localStorage.setItem(KEY, JSON.stringify(state.value));
        } catch {
          /* storage unavailable: state stays in memory */
        }
      };
      let t: ReturnType<typeof setTimeout> | undefined;
      watch(
        state,
        () => {
          clearTimeout(t);
          t = setTimeout(flush, 40);
        },
        { deep: true },
      );
      window.addEventListener("pagehide", flush);
      document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
    }
  }

  const course = (id: string) => state.value.courses.find((c) => c.id === id);
  const sheet = (id: string) => state.value.sheets.find((s) => s.id === id);
  const task = (id: string) => state.value.tasks.find((t) => t.id === id);
  const content = (id: string) => contentFor(id);
  const hasContent = (id: string) => !!contentFor(id);

  function historyFor(taskId: string) {
    return state.value.history
      .filter((h) => h.taskId === taskId)
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
  }

  function status(taskId: string): TaskStatus {
    const s = state.value.sessions[taskId];
    if (s && s.phase !== "done") return s.started ? "inprogress" : "new";
    const h = historyFor(taskId)[0];
    if (h) return h.outcome;
    return "new";
  }

  function sheetProgress(sheetId: string) {
    const sh = sheet(sheetId);
    const ids = sh?.taskIds ?? [];
    const done = ids.filter((id) => ["resolved", "gaps"].includes(status(id))).length;
    const started = ids.filter((id) => status(id) === "inprogress").length;
    return { done, total: ids.length, started };
  }

  function session(taskId: string): Session | undefined {
    return state.value.sessions[taskId];
  }

  function ensureSession(taskId: string): Session {
    if (!state.value.sessions[taskId]) {
      const s = createSession(taskId, state.value.settings);
      s.scenario = state.value.scenario;
      state.value.sessions[taskId] = s;
    }
    return state.value.sessions[taskId]!;
  }

  function discardSession(taskId: string) {
    delete state.value.sessions[taskId];
  }

  function finishSession(taskId: string): HistoryEntry | undefined {
    const s = state.value.sessions[taskId];
    const c = content(taskId);
    if (!s || !c) return;
    const open = hasOpenGap(s);
    const r = latestReview(s);
    const gaps = open ? [c.gap.revisit] : [];
    s.phase = "done";
    s.finishedAt = new Date().toISOString();
    const entry: HistoryEntry = {
      id: `h-${taskId}-${Date.now()}`,
      taskId,
      finishedAt: s.finishedAt,
      outcome: open || !r ? "gaps" : "resolved",
      gaps,
      entries: contributionEntries(s, c),
      attempts: s.reviews.length,
      hintsUsed: s.revealedHints.length,
      live: true,
      session: structuredClone(JSON.parse(JSON.stringify(s))),
    };
    state.value.history = [entry, ...state.value.history.filter((h) => h.taskId !== taskId)];
    delete state.value.sessions[taskId];
    return entry;
  }

  /** Bring a finished task back into the workspace. */
  function reopen(taskId: string) {
    const h = historyFor(taskId)[0];
    if (!h?.session) return false;
    const s = JSON.parse(JSON.stringify(h.session)) as Session;
    s.phase = "work";
    s.finishedAt = null;
    state.value.sessions[taskId] = s;
    return true;
  }

  function addScannedSheet(opts: {
    title: string;
    courseId: string;
    due: string;
    taskIds: string[];
    titles: Record<string, string>;
  }) {
    const base = scannedSheet;
    const sh: Sheet = {
      ...structuredClone(base.sheet),
      title: opts.title,
      courseId: opts.courseId,
      due: opts.due,
      taskIds: opts.taskIds,
      addedAt: new Date().toISOString(),
    };
    const tasks = base.tasks
      .filter((t) => opts.taskIds.includes(t.id))
      .map((t) => ({ ...t, courseId: opts.courseId, title: opts.titles[t.id] ?? t.title }));
    state.value.sheets = [sh, ...state.value.sheets.filter((s) => s.id !== sh.id)];
    state.value.tasks = [...tasks, ...state.value.tasks.filter((t) => !opts.taskIds.includes(t.id))];
    return sh;
  }

  function sheetExists(id: string) {
    return state.value.sheets.some((s) => s.id === id);
  }

  function removeSheet(id: string) {
    const sh = sheet(id);
    if (!sh) return;
    state.value.sheets = state.value.sheets.filter((s) => s.id !== id);
    state.value.tasks = state.value.tasks.filter((t) => t.sheetId !== id);
    sh.taskIds.forEach((t) => {
      delete state.value.sessions[t];
    });
  }

  function addCourse(name: string): Course {
    const tones = ["meadow", "coral", "sky", "dusk", "sunrise"] as const;
    const illos = ["hills", "sun", "blocks", "waves", "orbit"] as const;
    const n = state.value.courses.length;
    const c: Course = {
      id: `c-${Date.now()}`,
      name,
      term: "Autumn 2026",
      tone: tones[n % tones.length]!,
      illo: illos[n % illos.length]!,
    };
    state.value.courses.push(c);
    return c;
  }

  function resetEverything() {
    const fresh = initial();
    Object.assign(state.value, fresh);
  }

  const openTasks = computed(() =>
    state.value.sheets
      .filter((s) => s.taskIds.some((id) => !["resolved", "gaps"].includes(status(id))))
      .sort((a, b) => a.due.localeCompare(b.due))
      .flatMap((s) =>
        s.taskIds
          .filter((id) => !["resolved", "gaps"].includes(status(id)))
          .map((id) => ({ sheet: s, task: task(id)! })),
      )
      .filter((x) => x.task),
  );

  const activeSessions = computed(() =>
    Object.values(state.value.sessions).filter((s) => s.started && s.phase !== "done"),
  );

  const revisit = computed(() =>
    state.value.history
      .filter((h) => h.outcome === "gaps" && h.gaps.length)
      .flatMap((h) => h.gaps.map((g) => ({ gap: g, entry: h }))),
  );

  return {
    state,
    course,
    sheet,
    task,
    content,
    hasContent,
    historyFor,
    status,
    sheetProgress,
    session,
    ensureSession,
    discardSession,
    finishSession,
    reopen,
    addScannedSheet,
    sheetExists,
    removeSheet,
    addCourse,
    resetEverything,
    openTasks,
    activeSessions,
    revisit,
  };
}
