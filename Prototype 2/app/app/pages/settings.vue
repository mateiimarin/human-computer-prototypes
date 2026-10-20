<script setup lang="ts">
import { toast } from 'vue-sonner'
import { LogOut, RotateCcw, Sun, Moon, Monitor } from '@lucide/vue'

const { ws, reset, signOut } = useWorkspace()
const resetOpen = ref(false)
const name = ref(ws.value.profile.name)
const email = ref(ws.value.profile.email)
const emailBad = computed(() => !/^\S+@\S+\.\S+$/.test(email.value))
const dirty = computed(() => name.value !== ws.value.profile.name || email.value !== ws.value.profile.email)

function saveProfile() {
  if (emailBad.value || name.value.trim().length < 2) return
  ws.value.profile.name = name.value.trim(); ws.value.profile.email = email.value.trim()
  toast.success('Profile saved')
}
async function doReset() { resetOpen.value = false; reset(); name.value = ws.value.profile.name; email.value = ws.value.profile.email; toast('Workspace reset to its starting point'); await navigateTo('/') }
async function out() { signOut(); await navigateTo('/sign-in') }
const helps = [{ v: 'questions', l: 'Questions only' }, { v: 'hints', l: 'Hints' }, { v: 'steps', l: 'Step by step' }]
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader title="Settings" description="Your account and a few preferences. Nothing here changes how evidence works." />

    <div class="divide-border divide-y">
      <section class="space-y-5 py-8" aria-labelledby="s-profile">
        <h2 id="s-profile" class="text-lg font-semibold">Profile</h2>
        <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="saveProfile">
          <div class="space-y-2"><UiLabel for="p-name">Name</UiLabel><UiInput id="p-name" v-model="name" autocomplete="name" /></div>
          <div class="space-y-2"><UiLabel for="p-email">Email</UiLabel><UiInput id="p-email" v-model="email" type="email" autocomplete="email" :aria-invalid="emailBad" /><p v-if="emailBad" class="text-gap-foreground text-sm" role="alert">Enter an email like name@university.edu.</p></div>
          <div class="sm:col-span-2"><UiButton type="submit" :disabled="!dirty || emailBad">Save changes</UiButton></div>
        </form>
      </section>

      <section class="space-y-5 py-8" aria-labelledby="s-look">
        <h2 id="s-look" class="text-lg font-semibold">Appearance</h2>
        <div class="flex flex-wrap items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Theme</p><p class="text-muted-foreground text-sm">Dark is the default. System follows your device.</p></div>
          <UiToggleGroup type="single" :model-value="ws.settings.theme" class="bg-muted gap-1 rounded-lg p-1" aria-label="Theme" @update:model-value="(v) => v && (ws.settings.theme = v as any)">
            <UiToggleGroupItem value="light" class="h-9 gap-2 rounded-md px-4"><Sun class="size-4" /> Light</UiToggleGroupItem><UiToggleGroupItem value="dark" class="h-9 gap-2 rounded-md px-4"><Moon class="size-4" /> Dark</UiToggleGroupItem><UiToggleGroupItem value="system" class="h-9 gap-2 rounded-md px-4"><Monitor class="size-4" /> System</UiToggleGroupItem>
          </UiToggleGroup>
        </div>
        <div class="flex items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Reduce motion</p><p class="text-muted-foreground text-sm">Swap animations for instant changes.</p></div><UiSwitch v-model="ws.settings.reduceMotion" aria-label="Reduce motion" /></div>
        <div class="flex items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Larger text</p><p class="text-muted-foreground text-sm">Scale the interface up by about 12%.</p></div><UiSwitch v-model="ws.settings.largeText" aria-label="Larger text" /></div>
      </section>

      <section class="space-y-5 py-8" aria-labelledby="s-study">
        <h2 id="s-study" class="text-lg font-semibold">Studying</h2>
        <div class="flex flex-wrap items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Starting help level</p><p class="text-muted-foreground text-sm">What the companion offers first. You can change it in any session.</p></div>
          <UiToggleGroup type="single" :model-value="ws.settings.defaultHelp" class="bg-muted gap-1 rounded-lg p-1" aria-label="Starting help level" @update:model-value="(v) => v && (ws.settings.defaultHelp = v as any)"><UiToggleGroupItem v-for="h in helps" :key="h.v" :value="h.v" class="h-9 rounded-md px-4">{{ h.l }}</UiToggleGroupItem></UiToggleGroup>
        </div>
        <div class="flex items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Ask how sure I am</p><p class="text-muted-foreground text-sm">Show the confidence question after each answer in checks.</p></div><UiSwitch v-model="ws.settings.askConfidence" aria-label="Ask how sure I am" /></div>
      </section>

      <section class="space-y-5 py-8" aria-labelledby="s-rem">
        <h2 id="s-rem" class="text-lg font-semibold">Reminders</h2>
        <div class="flex items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Questions that are due</p><p class="text-muted-foreground text-sm">A quiet nudge when saved questions come due.</p></div><UiSwitch v-model="ws.settings.remindDue" aria-label="Due reminders" /></div>
        <div class="flex flex-wrap items-center justify-between gap-4"><div><p class="text-[15px] font-medium">Weekly review</p><p class="text-muted-foreground text-sm">One reminder a week.</p></div>
          <div class="flex items-center gap-3">
            <UiSelect v-model="ws.settings.weeklyDay" :disabled="!ws.settings.remindWeekly"><UiSelectTrigger class="bg-composer w-36 rounded-lg border-0" aria-label="Day of the week"><UiSelectValue /></UiSelectTrigger><UiSelectContent><UiSelectItem v-for="d in ['Monday','Wednesday','Friday','Saturday','Sunday']" :key="d" :value="d">{{ d }}</UiSelectItem></UiSelectContent></UiSelect>
            <UiSwitch v-model="ws.settings.remindWeekly" aria-label="Weekly review reminder" />
          </div>
        </div>
      </section>

      <section class="space-y-5 py-8" aria-labelledby="s-data">
        <h2 id="s-data" class="text-lg font-semibold">Account and data</h2>
        <div class="flex flex-wrap gap-3"><UiButton variant="outline" @click="out"><LogOut /> Sign out</UiButton><UiButton variant="ghost" class="text-destructive hover:bg-destructive-surface" @click="resetOpen = true"><RotateCcw /> Reset workspace…</UiButton></div>
      </section>
    </div>

    <UiAlertDialog v-model:open="resetOpen">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader><UiAlertDialogTitle>Reset your workspace?</UiAlertDialogTitle><UiAlertDialogDescription>This removes every session, saved question, added sheet and piece of evidence, and restores the starting workspace.</UiAlertDialogDescription></UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2"><UiAlertDialogCancel as-child><UiButton variant="ghost">Cancel</UiButton></UiAlertDialogCancel><UiAlertDialogAction as-child><UiButton variant="destructive" @click="doReset">Reset workspace</UiButton></UiAlertDialogAction></UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
