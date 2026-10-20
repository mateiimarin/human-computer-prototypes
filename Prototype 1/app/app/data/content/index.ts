import type { TaskContent } from "../types";
import { t1 } from "./t1";
import { t2 } from "./t2";
import { t4 } from "./t4";
import { t5 } from "./t5";

export const contents: Record<string, TaskContent> = { t1, t2, t4, t5 };

export function contentFor(taskId: string): TaskContent | undefined {
  return contents[taskId];
}
