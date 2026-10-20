export default defineNuxtRouteMiddleware((to) => {
  const app = useApp();
  const { signedIn, onboarded } = app.state.value;
  const open = ["/welcome"];

  if (!signedIn && !open.includes(to.path)) return navigateTo("/welcome");
  if (signedIn && to.path === "/welcome") return navigateTo(onboarded ? "/" : "/onboarding");
  if (signedIn && !onboarded && to.path !== "/onboarding") return navigateTo("/onboarding");

  // Task journey: make sure the task and its session exist.
  const match = to.path.match(/^\/task\/([^/]+)(?:\/(setup|work|review|reflect))?$/);
  if (match) {
    const [, id, step] = match;
    const task = app.task(id!);
    if (!task) return navigateTo("/library", { replace: true });
    if (!step) return;
    if (!app.hasContent(id!)) return navigateTo(`/task/${id}`, { replace: true });
    const s = app.ensureSession(id!);
    if (step !== "setup" && !s.started) return navigateTo(`/task/${id}/setup`, { replace: true });
    if ((step === "review" || step === "reflect") && !s.reviews.length)
      return navigateTo(`/task/${id}/work`, { replace: true });
  }
});
