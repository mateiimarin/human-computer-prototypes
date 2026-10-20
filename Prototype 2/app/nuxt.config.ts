import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-19',
  ssr: false,
  devtools: { enabled: false },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', 'motion-v/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false, ignore: ['**/ui/**'] }],
  shadcn: { prefix: 'Ui', componentDir: './app/components/ui' },
  colorMode: { classSuffix: '', preference: 'dark', fallback: 'dark', storageKey: 'prove-it:theme' },
  alias: { cn: decodeURIComponent(new URL('./app/lib/utils.ts', import.meta.url).pathname) },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { include: ['@lucide/vue', '@vueuse/core', 'class-variance-authority', 'clsx', 'tailwind-merge', 'katex', 'reka-ui', 'shiki', 'vue-sonner', 'motion-v'] },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Prove-it',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'description', content: 'Study with help, then show what you can explain on your own.' },
        { name: 'theme-color', content: '#0e0e0e' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: false,
  },
  typescript: { strict: true },
})
