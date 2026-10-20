/** A session screen opened without an active session (refresh after discard, stale link) lands on the setup screen. */
export default defineNuxtRouteMiddleware(() => {
  const { ws } = useWorkspace()
  if (!ws.value.active) return navigateTo('/study?resume=none')
})
