export default defineNuxtRouteMiddleware((to) => {
  const app = useApp();
  // Task journey: make sure the exercise and its session exist.
  const match = to.path.match(/^\/task\/([^/]+)(?:\/(setup|work|review|reflect))?$/);
  if (match) {
    const [, id, step] = match;
    const task = app.task(id!);
    if (!task) return navigateTo("/", { replace: true });
    if (!step) return;
    if (!app.hasContent(id!)) return navigateTo(`/task/${id}`, { replace: true });
    const s = app.ensureSession(id!);
    if (step !== "setup" && !s.started) return navigateTo(`/task/${id}/setup`, { replace: true });
    if ((step === "review" || step === "reflect") && !s.reviews.length)
      return navigateTo(`/task/${id}/work`, { replace: true });
  }
});
