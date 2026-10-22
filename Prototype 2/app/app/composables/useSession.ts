import { packs } from '~/data/packs'
import type { ActiveSession, CheckId, StepId } from '~/data/session'
import type { EvidenceState, Pack } from '~/data/types'
import { blankSession, buildEntries, buildTwinEntries, packOf, resumePath } from '~/lib/session'
import { fmtTime } from '~/lib/format'

/** Everything a session screen needs: the active session, its pack, and the actions that change it. */
export function useSession() {
  const w = useWorkspace()
  const { ws } = w

  const session = computed<ActiveSession | null>(() => ws.value.active)
  const pack = computed<Pack | undefined>(() => (session.value ? packs[session.value.packId] : undefined))

  /** Non-null accessor for screens that sit behind the session middleware. */
  function need() {
    return { s: ws.value.active!, p: packOf(ws.value.active!) }
  }

  /** Start an exercise, or resume it where it was left. One click from the list, no page in between. */
  function open(packId: string) {
    const s = (ws.value.open[packId] ??= blankSession(packs[packId]!))
    ws.value.active = s
    return navigateTo(resumePath(s))
  }

  /** Forget an exercise's open session, so it starts again from the baseline. */
  function startOver(packId: string) {
    delete ws.value.open[packId]
    if (ws.value.active?.packId === packId) ws.value.active = null
  }

  function go(step: StepId) {
    const s = ws.value.active
    if (!s) return navigateTo('/')
    s.step = step
    return navigateTo(resumePath(s))
  }

  function markAssisted(check: CheckId) {
    const s = ws.value.active
    if (s && !s.assisted.includes(check)) s.assisted.push(check)
  }
  /** `later` records the same missing evidence, but as a check the student means to come back to. */
  function markSkipped(check: CheckId, later = false) {
    const s = ws.value.active
    if (!s) return
    if (!s.skipped.includes(check)) s.skipped.push(check)
    s.deferred = s.deferred.filter(c => c !== check)
    if (later) s.deferred.push(check)
  }

  /** Turn what the session has produced into evidence entries (a new attempt each time). */
  function commit() {
    const { s, p } = need()
    const attempt = 1 + new Set(ws.value.entries.filter(e => e.sessionId === s.id && e.source === 'session').map(e => e.attempt)).size
    const entries = buildEntries(p, s, p.title, attempt)
    ws.value.entries.push(...entries)
    s.entryIds.push(...entries.map(e => e.id))
    return entries
  }

  function commitTwin() {
    const { s, p } = need()
    const n = s.twin.attempts.length + 1
    const entries = buildTwinEntries(p, s, n + 1)
    ws.value.entries.push(...entries)
    s.entryIds.push(...entries.map(e => e.id))
    s.twin.attempts.push({
      at: new Date().toISOString(), label: `Retry · ${fmtTime(new Date())}`,
      states: Object.fromEntries(entries.map(e => [e.sub, e.state])),
    })
  }

  /** Close the session: it moves to the past sessions and the exercise can be started again. */
  function finish() {
    const s = ws.value.active
    if (!s) return
    const p = packOf(s)
    if (s.post.submitted || s.post.skipped) {
      const last = ws.value.entries.filter(e => e.sessionId === s.id && e.source === 'session')
      const bySub: Record<string, EvidenceState> = {}
      for (const e of last) bySub[e.sub] = e.state
      w.archiveSession({
        id: s.id, packId: s.packId, title: p.title,
        condition: s.assisted.length === 0 ? 'independent' : s.assisted.length === 5 ? 'assisted' : 'mixed',
        line: sessionLine(bySub, p), bySub,
      })
    }
    delete ws.value.open[s.packId]
    ws.value.active = null
  }

  return { w, session, pack, need, open, startOver, go, markAssisted, markSkipped, commit, commitTwin, finish }
}

function sessionLine(bySub: Record<string, string>, p: Pack) {
  return p.subs.map(s => `${s.name} ${bySub[s.id] ?? 'unverified'}`).join(' · ')
}

/** Record which screen a session is on, so resume and the stage stepper always agree with what the student sees. */
export function useStep(step: StepId) {
  const { ws } = useWorkspace()
  watchEffect(() => { if (ws.value.active) ws.value.active.step = step })
}
