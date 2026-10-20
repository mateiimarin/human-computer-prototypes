<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'
import { ChevronsUpDown, Check, Plus } from '@lucide/vue'

defineProps<{ collapsed?: boolean }>()
const { ws, course, setCourse } = useWorkspace()
const cmd = useCommandMenu()
const { setOpenMobile } = useSidebar()

const initials = computed(() => course.value.name.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2) || 'C')

async function pick(id: string) {
  if (id === ws.value.courseId) return
  setCourse(id)
  setOpenMobile(false)
  await navigateTo('/')
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger v-if="!collapsed" as-child>
      <button class="hover:bg-sidebar-accent flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors" aria-label="Switch course">
        <span class="bg-sidebar-accent grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold">{{ initials }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm leading-4 font-medium">{{ course.name }}</span>
          <span class="text-muted-foreground block truncate text-xs leading-4">{{ course.code }} · {{ course.term }}</span>
        </span>
        <ChevronsUpDown class="text-muted-foreground size-4 shrink-0" />
      </button>
    </UiDropdownMenuTrigger>
    <UiTooltip v-else>
      <UiTooltipTrigger as-child>
        <UiDropdownMenuTrigger as-child>
          <button class="bg-sidebar-accent hover:bg-accent grid size-10 place-items-center rounded-lg text-xs font-semibold transition-colors" :aria-label="`Course: ${course.name}. Switch course`">{{ initials }}</button>
        </UiDropdownMenuTrigger>
      </UiTooltipTrigger>
      <UiTooltipContent side="right">{{ course.name }}</UiTooltipContent>
    </UiTooltip>
    <UiDropdownMenuContent align="start" :side="collapsed ? 'right' : 'bottom'" class="w-64 p-1.5">
      <UiDropdownMenuLabel class="text-muted-foreground px-2 text-xs">Courses</UiDropdownMenuLabel>
      <UiDropdownMenuItem v-for="c in ws.courses" :key="c.id" class="h-11 gap-3" @select="pick(c.id)">
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium">{{ c.name }}</span>
          <span class="text-muted-foreground block text-xs">{{ c.code }}</span>
        </span>
        <Check v-if="c.id === course.id" class="size-4" />
      </UiDropdownMenuItem>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem class="h-10 gap-2" @select="cmd.addCourse.value = true"><Plus class="size-4" /> Add a course</UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
