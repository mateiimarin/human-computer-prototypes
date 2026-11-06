/** After each route change, move focus to the page so keyboard and screen-reader users start at the top. */
export default defineNuxtPlugin(() => {
  const router = useRouter();
  router.afterEach((to, from) => {
    if (to.path === from.path || to.hash) return;
    nextTick(() => {
      setTimeout(() => {
        const main = document.getElementById("main");
        main?.focus({ preventScroll: true });
        if (!to.hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }, 60);
    });
  });
});
