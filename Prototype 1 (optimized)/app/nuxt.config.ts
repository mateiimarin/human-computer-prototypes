import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-10-19",
  ssr: false,
  devtools: { enabled: false },
  modules: ["shadcn-nuxt", "motion-v/nuxt"],
  shadcn: { prefix: "Ui", componentDir: "@/components/ui" },
  components: [{ path: "~/components", pathPrefix: false, ignore: ["**/ui/**"] }],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@lucide/vue",
        "@vueuse/core",
        "class-variance-authority",
        "cn",
        "clsx",
        "tailwind-merge",
        "reka-ui",
        "vue-sonner",
        "motion-v",
        "katex",
      ],
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      title: "Attempt First",
      meta: [
        {
          name: "description",
          content:
            "Attempt First is a study workspace where you do the thinking and get help with the rest.",
        },
        { name: "theme-color", content: "#fbf6ea" },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
  },
  typescript: { strict: true },
});
