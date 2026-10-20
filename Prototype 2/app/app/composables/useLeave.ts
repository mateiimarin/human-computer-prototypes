export function useLeave() {
  const open = useState('leave-dialog', () => false)
  const panel = useState('session-panel', () => false)
  const refs = useState('references-sheet', () => false)
  const confirmRefs = useState('references-confirm', () => false)
  return { open, panel, refs, confirmRefs }
}
