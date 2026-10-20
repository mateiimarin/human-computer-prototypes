<script setup lang="ts">
/** A document-like preview of an uploaded sheet. Always paper-white, in both themes. */
defineProps<{ title: string; exercises: string[]; fileName: string; pages?: number }>()
</script>

<template>
  <figure class="mx-auto w-full max-w-sm">
    <div class="rounded-xl bg-white p-6 text-[#15151f] ring-1 ring-black/10">
      <div class="border-b border-black/10 pb-4">
        <p class="text-xs text-black/50">Algorithms and Data Structures</p>
        <p class="mt-1 text-lg leading-6 font-semibold">{{ title }}</p>
      </div>
      <div class="space-y-5 pt-4">
        <div v-for="(e, i) in exercises" :key="e" class="space-y-2">
          <p class="text-[13px] font-semibold">Exercise {{ i + 1 }}. {{ e }}</p>
          <div class="space-y-1.5"><span class="block h-1.5 w-full rounded-full bg-black/10" /><span class="block h-1.5 w-11/12 rounded-full bg-black/10" /><span class="block h-1.5 w-2/3 rounded-full bg-black/10" /></div>
        </div>
      </div>
    </div>
    <figcaption class="text-muted-foreground mt-3 text-center text-xs">{{ fileName }}<template v-if="pages"> · {{ pages }} pages</template></figcaption>
  </figure>
</template>
