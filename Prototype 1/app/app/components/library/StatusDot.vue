<script setup lang="ts">
import { Check, Flag } from "@lucide/vue";
import type { TaskStatus } from "~/composables/useApp";

defineProps<{ status: TaskStatus }>();
const labels: Record<TaskStatus, string> = {
  new: "Not started",
  inprogress: "In progress",
  resolved: "Finished",
  gaps: "Finished with a point to revisit",
};
</script>

<template>
  <span class="relative grid size-7 shrink-0 place-items-center" role="img" :aria-label="labels[status]">
    <span v-if="status === 'new'" class="bg-card size-6 rounded-full border-2 border-foreground/25" />
    <span v-else-if="status === 'inprogress'" class="bg-tangerine animate-pulse-ring size-6 rounded-full border-[5px] border-[#ffd0ae]" />
    <span v-else-if="status === 'resolved'" class="bg-forest grid size-7 place-items-center rounded-full text-white"><Check class="size-4" :stroke-width="3" /></span>
    <span v-else class="bg-warning text-warning-foreground ring-mixed-foreground/30 grid size-7 place-items-center rounded-full ring-2"><Flag class="size-3.5" :stroke-width="2.6" /></span>
  </span>
</template>
