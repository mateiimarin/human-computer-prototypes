import type { Session } from "~/data/types";
import { contentFor } from "~/data/content";

/** The live session for the task in the current route. */
export function useSession() {
  const app = useApp();
  const route = useRoute();
  return computed(() => app.state.value.sessions[String(route.params.id)] as Session);
}

export function useTaskId() {
  const route = useRoute();
  return computed(() => String(route.params.id));
}

export function useTaskContent() {
  const id = useTaskId();
  return computed(() => contentFor(id.value)!);
}
