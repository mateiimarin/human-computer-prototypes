<script setup lang="ts">
import { toast } from 'vue-sonner'

const cmd = useCommandMenu()
const { addCourse } = useWorkspace()
const name = ref('')
const code = ref('')
const error = ref('')

async function submit() {
  if (name.value.trim().length < 3) { error.value = 'Give the course a name of at least three letters.'; return }
  addCourse(name.value, code.value)
  toast.success(`${name.value.trim()} added`, { description: 'Add an exercise sheet to start studying.' })
  cmd.addCourse.value = false
  name.value = ''; code.value = ''; error.value = ''
  await navigateTo('/')
}
watch(() => cmd.addCourse.value, (o) => { if (!o) error.value = '' })
</script>

<template>
  <UiDialog v-model:open="cmd.addCourse.value">
    <UiDialogContent class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>Add a course</UiDialogTitle>
        <UiDialogDescription>Courses keep sheets, concepts and review questions apart.</UiDialogDescription>
      </UiDialogHeader>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <UiLabel for="course-name">Course name</UiLabel>
          <UiInput id="course-name" v-model="name" placeholder="e.g. Linear Algebra" :aria-invalid="!!error" autocomplete="off" />
          <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>
        </div>
        <div class="space-y-2">
          <UiLabel for="course-code">Course code <span class="text-muted-foreground font-normal">(optional)</span></UiLabel>
          <UiInput id="course-code" v-model="code" placeholder="e.g. MATH 101" autocomplete="off" />
        </div>
        <UiDialogFooter class="gap-2 pt-2">
          <UiButton type="button" variant="ghost" @click="cmd.addCourse.value = false">Cancel</UiButton>
          <UiButton type="submit">Add course</UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
