<script setup lang="ts">
import { ArrowRight, Loader2 } from '@lucide/vue'

definePageMeta({ layout: 'blank' })
const { ws, signIn } = useWorkspace()
const email = ref(ws.value.profile.email)
const error = ref('')
const loading = ref(false)

async function go() {
  if (!/^\S+@\S+\.\S+$/.test(email.value)) { error.value = 'Enter your email, like name@university.edu.'; return }
  error.value = ''; loading.value = true
  await new Promise(r => setTimeout(r, 700))
  signIn(); loading.value = false
  await navigateTo('/')
}
</script>

<template>
  <div class="grid min-h-dvh place-items-center p-6">
    <Reveal class="w-full max-w-sm space-y-8">
      <Logo />
      <div class="space-y-2">
        <h1 class="text-[28px] leading-9 font-semibold" tabindex="-1">Sign in</h1>
        <p class="text-muted-foreground text-base leading-7">Study with help, then show what you can explain on your own.</p>
      </div>
      <form class="space-y-5" @submit.prevent="go">
        <div class="space-y-2"><UiLabel for="email">University email</UiLabel><UiInput id="email" v-model="email" type="email" autocomplete="email" placeholder="name@university.edu" :aria-invalid="!!error" /><p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p></div>
        <UiButton type="submit" size="xl" class="w-full" :disabled="loading"><Loader2 v-if="loading" class="animate-spin" /> {{ loading ? 'Signing in…' : 'Continue' }} <ArrowRight v-if="!loading" /></UiButton>
      </form>
      <div class="flex items-center gap-3"><span class="bg-border h-px flex-1" /><span class="text-muted-foreground text-xs">or</span><span class="bg-border h-px flex-1" /></div>
      <UiButton variant="outline" size="lg" class="w-full" :disabled="loading" @click="go">Continue with your university account</UiButton>
    </Reveal>
  </div>
</template>
