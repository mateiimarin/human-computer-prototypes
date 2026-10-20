<script setup lang="ts">
import { LogOut, Settings, SlidersHorizontal } from "@lucide/vue";

defineProps<{ compact?: boolean }>();
const app = useApp();
const open = ref(false);
const initials = computed(() => app.state.value.user.name.slice(0, 1).toUpperCase());

async function signOut() {
  open.value = false;
  app.state.value.signedIn = false;
  await navigateTo("/welcome");
}
</script>

<template>
  <UiDropdownMenu v-model:open="open">
    <UiDropdownMenuTrigger as-child>
      <button
        class="hover:bg-foreground/6 data-[state=open]:bg-foreground/8 flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors"
        aria-label="Account menu"
      >
        <span
          class="font-display grid size-10 shrink-0 place-items-center rounded-full text-base font-bold text-white"
          style="background: var(--grad-dusk)"
          >{{ initials }}</span
        >
        <span v-if="!compact" class="min-w-0 flex-1 leading-tight">
          <span class="block truncate text-[15px] font-semibold">{{ app.state.value.user.name }}</span>
          <span class="text-muted-foreground block truncate text-xs">{{ app.state.value.user.email }}</span>
        </span>
      </button>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="start" side="top" class="w-60 rounded-2xl p-1.5">
      <UiDropdownMenuLabel class="font-normal">
        <span class="block text-sm font-semibold">{{ app.state.value.user.name }}</span>
        <span class="text-muted-foreground block text-xs">{{ app.state.value.user.program }}</span>
      </UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem class="rounded-xl py-2.5" @select="navigateTo('/settings')">
        <Settings /> Settings
      </UiDropdownMenuItem>
      <UiDropdownMenuItem class="rounded-xl py-2.5" @select="navigateTo({ path: '/settings', query: { tab: 'assistance' } })">
        <SlidersHorizontal /> Assistance defaults
      </UiDropdownMenuItem>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem class="rounded-xl py-2.5" @select="signOut"><LogOut /> Sign out</UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
