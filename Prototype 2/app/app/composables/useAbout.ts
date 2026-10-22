/** The “About this prototype” popup. It opens on every page load, and the header button reopens it. */
export function useAbout() {
  const open = useState('about-open', () => true)
  return { open }
}
