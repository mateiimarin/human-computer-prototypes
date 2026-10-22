/** A session screen opened without an open session (a refresh clears everything) lands on the exercise list. */
export default defineNuxtRouteMiddleware(() => {
  const { ws } = useWorkspace()
  if (!ws.value.active) return navigateTo('/?notice=no-session')
})
