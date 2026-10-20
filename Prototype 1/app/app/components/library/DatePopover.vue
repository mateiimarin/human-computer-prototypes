<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import { dueLabel } from "~/lib/format";

withDefaults(defineProps<{ label?: string; variant?: "outline" | "secondary" | "ghost" }>(), { variant: "outline" });
const model = defineModel<string>({ required: true });
const open = ref(false);

const cal = computed({
  get: () => {
    const d = new Date(model.value);
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  },
  set: (v) => {
    if (!v) return;
    model.value = new Date(v.year, v.month - 1, v.day, 18).toISOString();
    open.value = false;
  },
});
</script>

<template>
  <UiPopover v-model:open="open">
    <UiPopoverTrigger as-child>
      <UiButton :variant="variant" size="default" :aria-label="label ?? 'Change deadline'">
        <CalendarDays /> {{ dueLabel(model) }}
      </UiButton>
    </UiPopoverTrigger>
    <UiPopoverContent class="w-auto rounded-3xl p-3" align="start">
      <UiCalendar v-model="cal" initial-focus />
    </UiPopoverContent>
  </UiPopover>
</template>
