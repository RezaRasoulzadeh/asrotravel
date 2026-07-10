// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-06-26",
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt"],
  css: ["~/assets/css/main.css", "~/assets/css/blog.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "fa",
        dir: "rtl",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },

  runtimeConfig: {
    apiBase: process.env.API_BASE_URL || "https://api.asrotravel.com/api",
    public: {
      siteUrl: process.env.SITE_URL || "https://asrotravel.com",
    },
  },

  nitro: {
    preset: "node-server",
  },

  typescript: {
    strict: true,
  },
});