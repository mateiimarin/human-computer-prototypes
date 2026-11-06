<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  defaultValue?: string | number
  modelValue?: string | number
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
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="cn('border-foreground/14 placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-card flex field-sizing-content min-h-20 w-full rounded-2xl border-2 px-4 py-3 text-base leading-7 transition-[color,box-shadow,border-color] outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  />
</template>
