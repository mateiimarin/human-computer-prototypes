/** Shared tutor-rail open/tab state, so a header shortcut can jump straight to "Who thought it?" from anywhere. */
export function useTutorPanel() {
  const open = useState("tutor-panel-open", () => false);
  const tab = useState<"tutor" | "sources">("tutor-panel-tab", () => "tutor");
  return { open, tab };
}
