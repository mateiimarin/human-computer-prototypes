export function useAssistDialog() {
  const open = useState("assist-dialog", () => false);
  return { open };
}
