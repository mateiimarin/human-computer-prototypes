<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "cn"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'placeholder:text-muted-foreground bg-composer h-11 w-full min-w-0 rounded-xl border border-transparent px-4 text-[15px] transition-[border-color,box-shadow,background-color] outline-none disabled:pointer-events-none disabled:text-muted-foreground',
      'focus-visible:border-input focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-ring/20',
      'aria-invalid:border-gap-dot aria-invalid:ring-gap-dot/15',
      props.class,
    )"
  >
</template>
