<script setup lang="ts">
import { ChevronsUpDown, Settings, LogOut, Sun, Moon, Monitor } from '@lucide/vue'

defineProps<{ collapsed?: boolean }>()
const { ws, signOut } = useWorkspace()
const initials = computed(() => ws.value.profile.name.split(' ').map(w => w[0]).join('').slice(0, 2))

async function out() {
  signOut()
  await navigateTo('/sign-in')
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger v-if="!collapsed" as-child>
      <button class="hover:bg-sidebar-accent flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors" aria-label="Account menu">
        <span class="bg-sidebar-accent grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold">{{ initials }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm leading-4 font-medium">{{ ws.profile.name }}</span>
          <span class="text-muted-foreground block truncate text-xs leading-4">{{ ws.profile.university }}</span>
        </span>
        <ChevronsUpDown class="text-muted-foreground size-4 shrink-0" />
      </button>
    </UiDropdownMenuTrigger>
    <UiTooltip v-else>
      <UiTooltipTrigger as-child>
        <UiDropdownMenuTrigger as-child>
          <button class="hover:bg-sidebar-accent grid size-10 place-items-center rounded-lg transition-colors" aria-label="Account menu">
            <span class="bg-sidebar-accent grid size-8 place-items-center rounded-full text-xs font-semibold">{{ initials }}</span>
          </button>
        </UiDropdownMenuTrigger>
      </UiTooltipTrigger>
      <UiTooltipContent side="right">{{ ws.profile.name }}</UiTooltipContent>
    </UiTooltip>
    <UiDropdownMenuContent :align="collapsed ? 'end' : 'start'" :side="collapsed ? 'right' : 'top'" class="w-60 p-1.5">
      <UiDropdownMenuLabel class="px-2 py-2">
        <span class="block text-sm font-medium">{{ ws.profile.name }}</span>
        <span class="text-muted-foreground block text-xs font-normal">{{ ws.profile.email }}</span>
      </UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem class="h-10 gap-2" @select="navigateTo('/settings')"><Settings class="size-4" /> Settings</UiDropdownMenuItem>
      <UiDropdownMenuSub>
        <UiDropdownMenuSubTrigger class="h-10 gap-2"><Sun class="size-4" /> Appearance</UiDropdownMenuSubTrigger>
        <UiDropdownMenuSubContent class="w-40 p-1.5">
          <UiDropdownMenuRadioGroup :model-value="ws.settings.theme" @update:model-value="(v) => (ws.settings.theme = v as any)">
            <UiDropdownMenuRadioItem value="light" class="h-10 gap-2"><Sun class="size-4" /> Light</UiDropdownMenuRadioItem>
            <UiDropdownMenuRadioItem value="dark" class="h-10 gap-2"><Moon class="size-4" /> Dark</UiDropdownMenuRadioItem>
            <UiDropdownMenuRadioItem value="system" class="h-10 gap-2"><Monitor class="size-4" /> System</UiDropdownMenuRadioItem>
          </UiDropdownMenuRadioGroup>
        </UiDropdownMenuSubContent>
      </UiDropdownMenuSub>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem class="h-10 gap-2" @select="out"><LogOut class="size-4" /> Sign out</UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
