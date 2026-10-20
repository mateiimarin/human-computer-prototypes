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
    :class="cn('placeholder:text-muted-foreground bg-composer flex field-sizing-content min-h-20 w-full resize-none rounded-xl border border-transparent px-4 py-3 text-base leading-7 transition-[border-color,box-shadow,background-color] outline-none focus-visible:border-input focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-ring/20 aria-invalid:border-gap-dot aria-invalid:ring-gap-dot/15 disabled:cursor-not-allowed disabled:text-muted-foreground', props.class)"
  />
</template>
