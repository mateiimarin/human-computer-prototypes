import { relative } from '~/lib/format'
import { stages, stageOf } from '~/lib/session'

/** What the exercise list says about each exercise: open, checked before, or not started. */
export function useExerciseStatus() {
  const { ws } = useWorkspace()
  return (packId: string): { label: string; tone: 'new' | 'active' | 'independent' | 'assisted' } => {
    const open = ws.value.open[packId]
    if (open) return { label: `In progress · ${stages.find(s => s.id === stageOf(open.step))?.label ?? 'Work'}`, tone: 'active' }
    const last = ws.value.sessions.find(s => s.packId === packId)
    if (last) return { label: `${last.condition === 'assisted' ? 'Finished with help' : 'Checked'} · ${relative(last.at)}`, tone: last.condition === 'assisted' ? 'assisted' : 'independent' }
    return { label: 'Not started', tone: 'new' }
  }
}
