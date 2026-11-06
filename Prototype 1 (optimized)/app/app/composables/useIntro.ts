/** The "About this prototype" dialog: opens on the first visit of a browser tab and from the About links. */
export function useIntro() {
  const open = useState("intro-dialog", () => false);
  return { open };
}
