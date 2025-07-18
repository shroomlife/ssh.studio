// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui-pro', '@pinia/nuxt'],
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/xterm.css'],
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
