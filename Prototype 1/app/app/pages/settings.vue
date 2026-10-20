<script setup lang="ts">
import { Bell, Download, Lock, LogOut, Palette, ShieldCheck, SlidersHorizontal, Trash2, User } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { Mode, StartApproach } from "~/data/types";

useHead({ title: "Settings · Attempt First" });
const app = useApp();
const route = useRoute();
const tab = ref(["profile", "assistance", "notifications", "appearance", "privacy"].includes(String(route.query.tab)) ? String(route.query.tab) : "profile");
watch(tab, (t) => navigateTo({ path: "/settings", query: { tab: t } }, { replace: true }));

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "assistance", label: "Assistance", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy and data", icon: ShieldCheck },
];

/* Profile draft */
const name = ref(app.state.value.user.name);
const program = ref(app.state.value.user.program);
const profileDirty = computed(() => name.value.trim() !== app.state.value.user.name || program.value.trim() !== app.state.value.user.program);
function saveProfile() {
  if (!name.value.trim()) return;
  app.state.value.user.name = name.value.trim();
  app.state.value.user.program = program.value.trim();
  toast.success("Profile updated");
}

/* Assistance draft */
const st = app.state.value.settings;
const mode = ref<Mode>(st.mode);
const budget = ref(String(st.budget));
const start = ref<StartApproach>(st.start);
const starter = ref(st.starterGuidance);
const pause = ref(String(st.pauseSeconds));
const assistDirty = computed(
  () => mode.value !== st.mode || Number(budget.value) !== st.budget || start.value !== st.start || starter.value !== st.starterGuidance || Number(pause.value) !== st.pauseSeconds,
);
const conflict = computed(() => mode.value === "questions" && start.value === "scaffold");
function saveAssist() {
  if (conflict.value) return;
  Object.assign(st, { mode: mode.value, budget: Number(budget.value), start: start.value, starterGuidance: starter.value, pauseSeconds: Number(pause.value) });
  toast.success("Defaults saved", { description: "New tasks start with these. Tasks in progress keep their own agreement." });
}
function resetAssist() {
  mode.value = st.mode;
  budget.value = String(st.budget);
  start.value = st.start;
  starter.value = st.starterGuidance;
  pause.value = String(st.pauseSeconds);
}

/* Data */
const deleteOpen = ref(false);
const confirmText = ref("");
function exportData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), history: app.state.value.history, sheets: app.state.value.sheets }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attempt-first-export.json";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Your data was downloaded");
}
async function wipe() {
  deleteOpen.value = false;
  app.resetEverything();
  toast.success("Your study data was deleted");
  await navigateTo("/welcome");
}
async function signOut() {
  app.state.value.signedIn = false;
  await navigateTo("/welcome");
}
const radio =
  "hover:border-foreground/30 has-[[data-state=checked]]:border-foreground flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-foreground/10 bg-card p-4 transition-all has-[[data-state=checked]]:shadow-md";
</script>

<template>
  <div class="space-y-10">
    <PageHeader eyebrow="Account" title="Settings" />

    <UiTabs v-model="tab" orientation="vertical" class="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
      <UiTabsList class="no-scrollbar h-auto w-full flex-row justify-start gap-1 overflow-x-auto rounded-3xl bg-transparent p-0 lg:flex-col lg:items-stretch">
        <UiTabsTrigger v-for="t in tabs" :key="t.id" :value="t.id" class="data-[state=active]:bg-card h-12 flex-none justify-start gap-3 rounded-full px-5 text-[15px] lg:w-full">
          <component :is="t.icon" class="size-[18px]" /> {{ t.label }}
        </UiTabsTrigger>
      </UiTabsList>

      <div class="min-w-0">
        <!-- PROFILE -->
        <UiTabsContent value="profile" class="max-w-xl space-y-8">
          <div class="flex items-center gap-5">
            <span class="font-display grid size-20 place-items-center rounded-full text-3xl font-bold text-white" style="background: var(--grad-dusk)">{{ (name || "A").slice(0, 1).toUpperCase() }}</span>
            <div>
              <h2 class="font-display text-2xl font-bold">{{ app.state.value.user.name }}</h2>
              <p class="text-muted-foreground">{{ app.state.value.user.email }}</p>
            </div>
          </div>
          <form class="space-y-5" @submit.prevent="saveProfile">
            <div class="space-y-2"><UiLabel for="p-name" class="font-semibold">First name</UiLabel><UiInput id="p-name" v-model="name" /></div>
            <div class="space-y-2"><UiLabel for="p-program" class="font-semibold">Programme</UiLabel><UiInput id="p-program" v-model="program" /></div>
            <div class="space-y-2">
              <UiLabel for="p-email" class="font-semibold">University email</UiLabel>
              <UiInput id="p-email" :model-value="app.state.value.user.email" readonly class="bg-foreground/5" aria-describedby="p-email-note" />
              <p id="p-email-note" class="text-muted-foreground text-sm">You sign in with this address, so it can't be changed here.</p>
            </div>
            <UiButton type="submit" size="lg" :disabled="!profileDirty || !name.trim()">Save changes</UiButton>
          </form>
        </UiTabsContent>

        <!-- ASSISTANCE -->
        <UiTabsContent value="assistance" class="max-w-2xl space-y-9">
          <div>
            <h2 class="font-display text-2xl font-bold">Assistance defaults</h2>
            <p class="text-muted-foreground mt-1">Every new task starts from these. You confirm them again before you begin, and can change them while you work.</p>
          </div>

          <fieldset class="space-y-3">
            <legend class="font-display mb-3 text-lg font-bold">How the tutor helps</legend>
            <UiRadioGroup v-model="mode" class="gap-3" aria-label="Default help">
              <label for="d-questions" :class="radio"><UiRadioGroupItem id="d-questions" value="questions" class="mt-1" /><span><span class="font-display block text-lg font-bold">Questions only</span><span class="text-muted-foreground block text-[15px]">Hints stay off.</span></span></label>
              <label for="d-hints" :class="radio"><UiRadioGroupItem id="d-hints" value="hints" class="mt-1" /><span><span class="font-display block text-lg font-bold">Questions and hints</span><span class="text-muted-foreground block text-[15px]">Small hints, one at a time, each after some thinking of your own.</span></span></label>
            </UiRadioGroup>
            <div v-if="mode === 'hints'" class="flex items-center gap-4 pt-2">
              <UiLabel class="font-semibold">Hints per task</UiLabel>
              <UiToggleGroup v-model="budget" type="single" class="bg-foreground/6 rounded-full p-1" aria-label="Hints per task">
                <UiToggleGroupItem value="3" class="data-[state=on]:bg-card rounded-full px-5 font-semibold data-[state=on]:shadow-md">3</UiToggleGroupItem>
                <UiToggleGroupItem value="5" class="data-[state=on]:bg-card rounded-full px-5 font-semibold data-[state=on]:shadow-md">5</UiToggleGroupItem>
              </UiToggleGroup>
            </div>
          </fieldset>

          <fieldset class="space-y-3">
            <legend class="font-display mb-3 text-lg font-bold">How a task begins</legend>
            <UiRadioGroup v-model="start" class="gap-3" aria-label="Default start">
              <label for="s-blank" :class="radio"><UiRadioGroupItem id="s-blank" value="blank" class="mt-1" /><span><span class="font-display block text-lg font-bold">A blank page</span><span class="text-muted-foreground block text-[15px]">Your own first step comes first.</span></span></label>
              <label for="s-scaffold" :class="radio"><UiRadioGroupItem id="s-scaffold" value="scaffold" class="mt-1" /><span><span class="font-display block text-lg font-bold">A guided scaffold</span><span class="text-muted-foreground block text-[15px]">Each step has a short prompt. Needs hints to be on.</span></span></label>
            </UiRadioGroup>
            <p v-if="conflict" role="alert" class="bg-warning text-warning-foreground rounded-2xl px-4 py-3 text-sm font-medium">A scaffold needs hints. Allow hints above, or start from a blank page.</p>
          </fieldset>

          <div class="flex items-start justify-between gap-6 border-y py-6">
            <div>
              <UiLabel for="d-starter" class="font-display text-lg font-bold">Offer a starter question</UiLabel>
              <p class="text-muted-foreground mt-1 text-[15px]">When a blank page is chosen, a gentle first question waits in the tutor panel.</p>
            </div>
            <UiSwitch id="d-starter" v-model="starter" />
          </div>

          <fieldset class="space-y-3">
            <legend class="font-display text-lg font-bold">Pause before more help</legend>
            <p class="text-muted-foreground text-[15px]">Asking for more help than you agreed to takes a short, cancelable pause. It keeps that choice deliberate.</p>
            <UiToggleGroup v-model="pause" type="single" class="bg-foreground/6 w-fit rounded-full p-1" aria-label="Pause length">
              <UiToggleGroupItem v-for="p in ['5', '10', '15']" :key="p" :value="p" class="data-[state=on]:bg-card rounded-full px-5 font-semibold data-[state=on]:shadow-md">{{ p }} seconds</UiToggleGroupItem>
            </UiToggleGroup>
          </fieldset>

          <p class="text-muted-foreground flex items-center gap-2.5 text-[15px]"><Lock class="size-4" /> Final answers stay hidden whichever you choose.</p>
          <div class="flex flex-wrap gap-3">
            <UiButton size="lg" :disabled="!assistDirty || conflict" @click="saveAssist">Save defaults</UiButton>
            <UiButton variant="ghost" size="lg" :disabled="!assistDirty" @click="resetAssist">Discard changes</UiButton>
          </div>
        </UiTabsContent>

        <!-- NOTIFICATIONS -->
        <UiTabsContent value="notifications" class="max-w-xl space-y-2">
          <h2 class="font-display mb-4 text-2xl font-bold">Notifications</h2>
          <div class="flex items-start justify-between gap-6 border-b py-5">
            <div><UiLabel for="n-remind" class="font-display text-lg font-bold">Deadline reminders</UiLabel><p class="text-muted-foreground mt-1 text-[15px]">An email the day before a sheet is due, if tasks are still open.</p></div>
            <UiSwitch id="n-remind" v-model="app.state.value.settings.reminders" />
          </div>
          <div class="flex items-start justify-between gap-6 py-5">
            <div><UiLabel for="n-digest" class="font-display text-lg font-bold">Weekly summary</UiLabel><p class="text-muted-foreground mt-1 text-[15px]">Sundays: the points you left open and the tasks coming up.</p></div>
            <UiSwitch id="n-digest" v-model="app.state.value.settings.weeklyDigest" />
          </div>
        </UiTabsContent>

        <!-- APPEARANCE -->
        <UiTabsContent value="appearance" class="max-w-xl space-y-2">
          <h2 class="font-display mb-4 text-2xl font-bold">Appearance</h2>
          <div class="flex items-start justify-between gap-6 border-b py-5">
            <div><UiLabel for="a-motion" class="font-display text-lg font-bold">Reduce motion</UiLabel><p class="text-muted-foreground mt-1 text-[15px]">Turns off transitions and movement. Your system setting is respected either way.</p></div>
            <UiSwitch id="a-motion" v-model="app.state.value.settings.reduceMotion" />
          </div>
          <div class="flex items-start justify-between gap-6 py-5">
            <div><UiLabel for="a-text" class="font-display text-lg font-bold">Larger text</UiLabel><p class="text-muted-foreground mt-1 text-[15px]">Increases text size across the app by about 12%.</p></div>
            <UiSwitch id="a-text" v-model="app.state.value.settings.largeText" />
          </div>
        </UiTabsContent>

        <!-- PRIVACY -->
        <UiTabsContent value="privacy" class="max-w-xl space-y-8">
          <div>
            <h2 class="font-display text-2xl font-bold">Privacy and data</h2>
            <p class="text-muted-foreground mt-2 text-[16px] leading-relaxed">Your attempts, hints and reflections are stored on this device. The tutor never sees your name, and final answers are never shown.</p>
          </div>
          <div class="space-y-3">
            <UiButton variant="outline" size="lg" @click="exportData"><Download /> Download my data</UiButton>
            <p class="text-muted-foreground text-sm">A JSON file with your sheets and session history.</p>
          </div>
          <div class="space-y-3 border-t pt-8">
            <h3 class="font-display text-lg font-bold">Delete everything</h3>
            <p class="text-muted-foreground text-[15px]">Removes sheets, sessions and history from this device, and signs you out. This can't be undone.</p>
            <UiButton variant="destructive" size="lg" @click="(confirmText = ''), (deleteOpen = true)"><Trash2 /> Delete my study data</UiButton>
          </div>
          <div class="border-t pt-8"><UiButton variant="secondary" size="lg" @click="signOut"><LogOut /> Sign out</UiButton></div>
        </UiTabsContent>
      </div>
    </UiTabs>

    <UiAlertDialog v-model:open="deleteOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Delete all your study data?</UiAlertDialogTitle>
          <UiAlertDialogDescription>Your sheets, attempts and history are removed from this device. Type <strong>delete</strong> to confirm.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiInput v-model="confirmText" aria-label="Type delete to confirm" placeholder="delete" />
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Keep my data</UiAlertDialogCancel>
          <UiAlertDialogAction class="bg-destructive hover:bg-destructive/90 text-white" :disabled="confirmText.trim().toLowerCase() !== 'delete'" @click="wipe">Delete everything</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
