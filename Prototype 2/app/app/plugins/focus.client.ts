/** After each route change, move focus to the page so keyboard and screen-reader users start at the top. */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.afterEach((to, from) => {
    if (to.path === from.path) return
    nextTick(() => {
      setTimeout(() => {
        document.getElementById('main')?.focus({ preventScroll: true })
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }, 80)
    })
  })
})
