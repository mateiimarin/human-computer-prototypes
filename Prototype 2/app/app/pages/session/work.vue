<script setup lang="ts">
import { ArrowUp, Plus, ClipboardPaste, Paperclip, X, Lightbulb, MessageCircleQuestion, ListChecks, LifeBuoy, ShieldCheck, FileSearch, Sparkles } from '@lucide/vue'
import { packOf } from '~/lib/session'
import { uid } from '~/lib/format'
import type { Msg } from '~/data/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('work')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const w = computed(() => s.value.work)

const thinking = ref(false)
const confirmSolution = ref(false)
const confirmCheck = ref(false)
const pasteOpen = ref(false)
const pasteText = ref('')
const pasteError = ref('')
const inputEl = ref<HTMLTextAreaElement>()
const fileEl = ref<HTMLInputElement>()
const attachments = ref<string[]>([])
function attach(files?: FileList | File[] | null) {
  for (const f of Array.from(files ?? [])) if (!attachments.value.includes(f.name)) attachments.value.push(f.name)
}
function onPaste(e: ClipboardEvent) {
  const imgs = Array.from(e.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (imgs.length) { e.preventDefault(); attachments.value.push(...imgs.map((_, i) => `Screenshot ${attachments.value.length + i + 1}.png`)) }
}

const hasOutline = computed(() => w.value.messages.some(m => m.kind === 'steps'))
const hasSolution = computed(() => w.value.messages.some(m => m.kind === 'solution'))

const scroller = ref<HTMLElement>()
function scrollEnd() {
  nextTick(() => setTimeout(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' }), 60))
}
function push(m: Omit<Msg, 'id'>) { w.value.messages.push({ id: uid('m'), ...m }); scrollEnd() }
async function companion(m: Omit<Msg, 'id'>, delay = 650) {
  thinking.value = true; scrollEnd()
  await new Promise(r => setTimeout(r, delay))
  thinking.value = false
  push(m)
}

function send() {
  const text = w.value.draft.trim()
  if (!text && !attachments.value.length) return
  const files = attachments.value.map(n => `Attached: ${n}`).join('\n')
  push({ role: 'student', text: [files, text].filter(Boolean).join('\n') })
  attachments.value = []
  w.value.draft = ''
  const list = pack.value.work.replies[w.value.help]
  const n = w.value.messages.filter(m => m.role === 'student').length
  companion({ role: 'companion', kind: 'reply', text: list[(n - 1) % list.length]! })
  if (w.value.help === 'steps' && !hasOutline.value) setTimeout(showOutline, 900)
}
function askHint() {
  const n = w.value.hints
  if (n >= pack.value.work.hints.length) {
    push({ role: 'student', text: 'Another hint, please.' })
    companion({ role: 'companion', kind: 'reply', text: 'That was the last hint. Try the outline, or open the solution when you’re ready. Opening it is your call.' })
    return
  }
  push({ role: 'student', text: n === 0 ? 'Can I have a hint?' : 'One more hint, please.' })
  w.value.help = 'hints'
  w.value.hints++
  companion({ role: 'companion', kind: 'hint', text: pack.value.work.hints[n]!, note: `Hint ${n + 1} of ${pack.value.work.hints.length}` })
}
function askQuestion() {
  const list = pack.value.work.questions
  push({ role: 'student', text: 'Ask me a question to get me started.' })
  w.value.help = 'questions'
  const q = list[w.value.questions % list.length]!
  w.value.questions++
  companion({ role: 'companion', kind: 'question', text: q })
}
function showOutline() {
  if (hasOutline.value) { scrollEnd(); return }
  w.value.help = 'steps'
  push({ role: 'student', text: 'Show me an outline.' })
  companion({ role: 'companion', kind: 'steps', text: 'Here is the structure. Fill in the blanks yourself, then check them.' })
}
function revealSolution() {
  confirmSolution.value = false
  w.value.revealed = true
  w.value.help = 'solution'
  push({ role: 'student', text: 'Show me the full solution.' })
  companion({ role: 'companion', kind: 'solution', text: 'Here is the full worked solution. Read it, close it, and see whether you can reproduce each step.' }, 400)
}
function pick(level: 'questions' | 'hints' | 'steps' | 'solution') {
  w.value.help = level
  push({ role: 'companion', kind: 'reply', text: '', note: `Help level set to ${{ questions: 'Questions only', hints: 'Hints', steps: 'Step by step', solution: 'Show solution' }[level]}` })
}
function addAttempt() {
  if (pasteText.value.trim().length < 10) { pasteError.value = 'Paste your attempt first, even if it’s unfinished.'; return }
  w.value.attempt = pasteText.value.trim()
  push({ role: 'student', kind: 'attempt', text: pasteText.value.trim() })
  pasteOpen.value = false; pasteError.value = ''
  companion({ role: 'companion', kind: 'reply', text: 'Thanks, I’ve read it without judging it. Ask for sheet feedback to see line-by-line notes, or keep working.' })
}
function startCheck() { confirmCheck.value = false; go('explain') }
function onKey(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div ref="scroller" class="min-h-0 flex-1 overflow-y-auto pr-1 pb-6">
    <StageHeader
      title="Work on it" description="Ask for as much or as little help as you need. Nothing here counts as evidence; that comes in the check."
      next="Check your understanding when you’re ready. Your chat and solutions are then hidden."
    />

    <div class="mb-8 flex flex-wrap items-center gap-3">
      <UiButton size="lg" @click="confirmCheck = true"><ShieldCheck /> Check my understanding</UiButton>
      <UiButton v-if="w.attempt" variant="outline" size="lg" @click="go('sheet')"><FileSearch /> Sheet feedback</UiButton>
    </div>

    <ProblemCard :pack="pack" class="mb-10" />

    <!-- thread -->
    <ol class="flex-1 space-y-7" aria-label="Conversation" aria-live="polite">
      <template v-for="m in w.messages" :key="m.id">
        <li v-if="m.role === 'companion' && !m.text && m.note" class="text-muted-foreground flex items-center gap-3 text-xs">
          <span class="bg-border h-px flex-1" /> {{ m.note }} <span class="bg-border h-px flex-1" />
        </li>
        <li v-else-if="m.role === 'student'" class="animate-rise">
          <UiMessage align="end">
            <UiMessageContent>
              <UiBubble variant="muted" class="max-w-[85%]">
                <UiBubbleContent class="rounded-2xl px-4 py-3 text-base leading-7">
                  <CodeSnippet v-if="m.kind === 'attempt'" :code="m.text" title="my_attempt.py" class="-mx-2 -my-1 min-w-72" />
                  <RichText v-else :text="m.text" />
                </UiBubbleContent>
              </UiBubble>
            </UiMessageContent>
          </UiMessage>
        </li>
        <li v-else class="animate-rise flex gap-3">
          <span class="bg-assist text-assist-foreground mt-0.5 grid size-8 shrink-0 place-items-center rounded-full"><Sparkles class="size-4" /></span>
          <div class="min-w-0 flex-1 space-y-3">
          <div v-if="m.kind === 'hint'" class="bg-assist/50 border-assist-foreground/50 space-y-1 rounded-xl border-l-4 px-5 py-4">
            <p class="text-assist-foreground text-sm font-medium">{{ m.note }}</p>
            <p class="text-base leading-7"><RichText :text="m.text" /></p>
          </div>
          <template v-else>
            <p class="text-base leading-7"><RichText :text="m.text" /></p>
            <OutlineBlock v-if="m.kind === 'steps'" :pack="pack" :session="s" />
            <div v-if="m.kind === 'solution'" class="space-y-3">
              <ol class="space-y-2"><li v-for="(t, i) in pack.work.solution.steps" :key="i" class="bg-assist/50 flex gap-3 rounded-xl px-4 py-3 text-[15px] leading-7"><span class="text-assist-foreground font-semibold tabular-nums">{{ i + 1 }}</span><RichText :text="t" /></li></ol>
              <CodeSnippet :code="pack.work.solution.code" title="solution.py" />
            </div>
          </template>
          </div>
        </li>
      </template>
      <li v-if="thinking" class="text-muted-foreground animate-pulse text-[15px]" role="status">Thinking…</li>
    </ol>

    </div>

    <!-- composer -->
    <div class="bg-background shrink-0 space-y-3 pt-3 pb-4">
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
        <span class="text-muted-foreground hidden shrink-0 text-sm sm:inline">More help</span>
        <UiButton variant="outline" size="sm" class="shrink-0" @click="askQuestion"><MessageCircleQuestion /> Ask me a question</UiButton>
        <UiButton variant="outline" size="sm" class="shrink-0" @click="askHint"><Lightbulb class="text-assist-foreground" /> A hint</UiButton>
        <UiButton variant="outline" size="sm" class="shrink-0" @click="showOutline"><ListChecks /> An outline</UiButton>
        <UiButton variant="outline" size="sm" class="shrink-0" @click="hasSolution ? scrollEnd() : (confirmSolution = true)"><LifeBuoy /> The solution</UiButton>
      </div>
      <div class="bg-composer rounded-2xl p-2.5 shadow-composer transition-shadow focus-within:shadow-[0_0_0_2px_var(--ring)]">
        <textarea
          ref="inputEl" v-model="w.draft" rows="2" aria-label="Message the companion" placeholder="Describe your idea, paste a screenshot, or ask for help…"
          class="placeholder:text-muted-foreground h-14 w-full resize-none overflow-hidden bg-transparent px-3 pt-2 text-base leading-7 outline-none" @keydown="onKey" @paste="onPaste"
        />
        <ul v-if="attachments.length" class="flex flex-wrap gap-2 px-2 pb-1">
          <li v-for="n in attachments" :key="n" class="bg-background flex items-center gap-1.5 rounded-lg py-1 pr-1 pl-2.5 text-sm"><Paperclip class="size-3.5" /> {{ n }}<button class="hover:bg-accent rounded p-1" :aria-label="`Remove ${n}`" @click="attachments = attachments.filter(x => x !== n)"><X class="size-3.5" /></button></li>
        </ul>
        <div class="flex items-center gap-1 pt-1">
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child><UiButton variant="ghost" size="icon" class="rounded-lg" aria-label="Add your own work"><Plus /></UiButton></UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" side="top" class="w-64 p-1.5">
              <UiDropdownMenuItem class="h-11 gap-3" @select="pasteOpen = true"><ClipboardPaste class="size-4" /> Paste my solution</UiDropdownMenuItem>
              <UiDropdownMenuItem class="h-11 gap-3" @select="fileEl?.click()"><Paperclip class="size-4" /> Upload a file or photo</UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
          <input ref="fileEl" type="file" multiple class="sr-only" accept="image/*,.pdf,.txt,.py,.md" aria-label="Upload a file" @change="attach(($event.target as HTMLInputElement).files); ($event.target as HTMLInputElement).value = ''">
          <div class="ml-auto flex items-center gap-1.5">
            <HelpLevelPicker :model-value="w.help" @update:model-value="pick" @solution="confirmSolution = true" />
            <UiButton size="icon" class="rounded-lg" :disabled="!w.draft.trim() && !attachments.length" aria-label="Send" @click="send"><ArrowUp /></UiButton>
          </div>
        </div>
      </div>
    </div>

    <UiAlertDialog v-model:open="confirmSolution">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <div class="bg-assist text-assist-foreground mb-2 grid size-11 place-items-center rounded-xl"><LifeBuoy class="size-5" /></div>
          <UiAlertDialogTitle>Show the full solution?</UiAlertDialogTitle>
          <UiAlertDialogDescription class="leading-6">That’s fine when you’re stuck. The solution is hidden during your check, and your session notes that you opened it.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Not yet</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton @click="revealSolution">Show solution</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>

    <UiAlertDialog v-model:open="confirmCheck">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <div class="bg-check text-check-foreground mb-2 grid size-11 place-items-center rounded-xl"><ShieldCheck class="size-5" /></div>
          <UiAlertDialogTitle>Ready to check your understanding?</UiAlertDialogTitle>
          <UiAlertDialogDescription class="leading-6">Your conversation, hints and solutions will be hidden. You’ll explain the approach in your own words, then answer a few questions. Your work here stays saved.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Keep working</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton @click="startCheck">Start the check</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>

    <UiDialog v-model:open="pasteOpen">
      <UiDialogContent class="max-w-xl">
        <UiDialogHeader><UiDialogTitle>Paste your solution</UiDialogTitle><UiDialogDescription>Code or a few lines of reasoning, finished or not.</UiDialogDescription></UiDialogHeader>
        <div class="space-y-2">
          <UiTextarea v-model="pasteText" rows="8" class="font-mono text-sm" aria-label="Your solution" placeholder="def solve(…):" :aria-invalid="!!pasteError" />
          <p v-if="pasteError" class="text-gap-foreground text-sm" role="alert">{{ pasteError }}</p>
        </div>
        <UiDialogFooter class="gap-2 sm:justify-end">
          <div class="flex gap-2"><UiButton variant="ghost" @click="pasteOpen = false">Cancel</UiButton><UiButton @click="addAttempt">Add to conversation</UiButton></div>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
