export function useEvidenceSheet() {
  const sub = useState<string | null>('evidence-sheet', () => null)
  return { sub, open: (id: string) => (sub.value = id), close: () => (sub.value = null) }
}
