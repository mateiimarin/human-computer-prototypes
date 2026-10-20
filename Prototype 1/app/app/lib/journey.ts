import type { Phase } from "~/data/types";

export const phases = [
  { id: "setup", label: "Set up" },
  { id: "work", label: "Work" },
  { id: "review", label: "Review" },
  { id: "reflect", label: "Reflect" },
] as const;

export function phasePath(taskId: string, phase: Phase) {
  return `/task/${taskId}/${phase === "done" ? "reflect" : phase}`;
}
