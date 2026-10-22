/** The “Show references” route during a check: first a confirmation, then the references themselves. */
export function useReferences() {
  const sheet = useState('references-sheet', () => false)
  const confirm = useState('references-confirm', () => false)
  return { sheet, confirm }
}
