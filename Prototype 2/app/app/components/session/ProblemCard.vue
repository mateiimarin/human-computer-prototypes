<script setup lang="ts">
import { ChevronDown, FileText } from '@lucide/vue'
import type { Pack } from '~/data/types'

const props = withDefaults(defineProps<{ pack: Pack; collapsible?: boolean; startOpen?: boolean }>(), { collapsible: true, startOpen: true })
const open = ref(props.startOpen)
</script>

<template>
  <section class="border-border rounded-2xl border" aria-label="The problem">
    <button v-if="collapsible" class="flex w-full items-center gap-3 px-5 py-4 text-left" :aria-expanded="open" @click="open = !open">
      <span class="bg-muted grid size-9 shrink-0 place-items-center rounded-lg"><FileText class="size-4" /></span>
      <span class="min-w-0 flex-1"><span class="text-muted-foreground block text-xs">Exercise {{ pack.sheetNo }}</span><span class="block truncate text-[15px] leading-5 font-medium">{{ pack.title }}</span></span>
      <ChevronDown class="text-muted-foreground size-5 transition-transform duration-200" :class="open && 'rotate-180'" />
    </button>
    <div v-else class="flex items-center gap-3 px-5 pt-4">
      <span class="bg-muted grid size-9 shrink-0 place-items-center rounded-lg"><FileText class="size-4" /></span>
      <span><span class="text-muted-foreground block text-xs">Exercise {{ pack.sheetNo }}</span><span class="block text-[15px] leading-5 font-medium">{{ pack.title }}</span></span>
    </div>
    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden" enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-96 opacity-100"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden" leave-from-class="max-h-96 opacity-100" leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="open" class="space-y-2 px-5 pt-1 pb-5 text-base leading-7">
        <p><RichText :text="pack.statement" /></p>
        <p class="text-muted-foreground text-[15px]"><RichText :text="pack.example" /></p>
      </div>
    </Transition>
  </section>
</template>
