import { packs } from '~/data/packs'
import { relative } from '~/lib/format'
import { stages, stageOf } from '~/lib/session'

export function useExerciseStatus() {
  const { ws } = useWorkspace()
  return (packId: string): { label: string; tone: 'new' | 'active' | 'independent' | 'assisted' } => {
    const a = ws.value.active
    if (a && a.packId === packId) {
      const st = stages.find(s => s.id === stageOf(a.step))?.label ?? 'Work'
      return { label: `In progress · ${st}`, tone: 'active' }
    }
    const last = ws.value.sessions.find(s => s.packId === packId)
    if (last) return { label: `${last.condition === 'assisted' ? 'Assisted' : 'Checked'} · ${relative(last.at)}`, tone: last.condition === 'assisted' ? 'assisted' : 'independent' }
    return { label: 'Not started', tone: 'new' }
  }
}
export const packTitle = (id: string) => packs[id]!.title
