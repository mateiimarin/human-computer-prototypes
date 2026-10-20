<script setup lang="ts">
import type { PinInputInputProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PinInputInput, useForwardProps } from "reka-ui"

const props = defineProps<PinInputInputProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <PinInputInput
    data-slot="pin-input-slot"
    v-bind="forwardedProps"
    :class="cn('border-foreground/14 bg-card focus:border-ring focus:ring-ring/25 relative flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-xl font-semibold transition-all outline-none text-center focus:z-10 focus:ring-4 sm:w-14', props.class)"
  />
</template>
