export function useCommandMenu() {
  const open = useState('cmdk', () => false)
  const addCourse = useState('add-course', () => false)
  return { open, addCourse }
}
