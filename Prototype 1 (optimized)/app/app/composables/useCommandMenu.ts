export function useCommandMenu() {
  const open = useState("cmdk", () => false);
  return { open };
}
