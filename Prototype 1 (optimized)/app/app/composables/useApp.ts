import type { Scenario, Session } from "~/data/types";
import { contentFor } from "~/data/content";
import { defaults, tasks } from "~/data/exercises";
import { createSession, hasOpenGap } from "~/domain/session";

export type TaskStatus = "new" | "inprogress" | "finished";

interface AppState {
  /** One session per exercise, created when the student opens its set-up. */
  sessions: Record<string, Session>;
  /** Which prepared review outcome the next check shows (chosen with ⌘K). */
  scenario: Scenario;
}

function initial(): AppState {
  return { sessions: {}, scenario: "issue" };
}

export function useApp() {
  // Nothing is stored: a page refresh starts the whole prototype again.
  const state = useState<AppState>("app", initial);

  const task = (id: string) => tasks.find((t) => t.id === id);
  const content = (id: string) => contentFor(id);
  const hasContent = (id: string) => !!contentFor(id);

  function status(taskId: string): TaskStatus {
    const s = state.value.sessions[taskId];
    if (!s) return "new";
    if (s.phase === "done") return "finished";
    return s.started ? "inprogress" : "new";
  }

  function session(taskId: string): Session | undefined {
    return state.value.sessions[taskId];
  }

  function ensureSession(taskId: string): Session {
    if (!state.value.sessions[taskId]) {
      const s = createSession(taskId, defaults);
      s.scenario = state.value.scenario;
      state.value.sessions[taskId] = s;
    }
    return state.value.sessions[taskId]!;
  }

  /** Remove the session entirely, so the exercise starts from set-up again. */
  function startOver(taskId: string) {
    delete state.value.sessions[taskId];
  }

  /** Mark the session finished. It stays available to view or reopen. */
  function finishSession(taskId: string) {
    const s = state.value.sessions[taskId];
    if (!s) return;
    s.phase = "done";
    s.finishedAt = new Date().toISOString();
  }

  /** Bring a finished exercise back into the workspace. */
  function reopen(taskId: string) {
    const s = state.value.sessions[taskId];
    if (!s) return false;
    s.phase = "work";
    s.finishedAt = null;
    return true;
  }

  const hasOpenPoint = (taskId: string) => {
    const s = state.value.sessions[taskId];
    return !!s && hasOpenGap(s);
  };

  return { state, tasks, task, content, hasContent, status, session, ensureSession, startOver, finishSession, reopen, hasOpenPoint };
}
