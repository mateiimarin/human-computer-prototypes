export default defineNuxtRouteMiddleware((to) => {
  const { ws } = useWorkspace()
  if (!ws.value.signedIn && to.path !== '/sign-in') return navigateTo('/sign-in')
  if (ws.value.signedIn && to.path === '/sign-in') return navigateTo('/')
})
