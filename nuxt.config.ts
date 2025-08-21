// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt'],
  ssr: false,
  devtools: { enabled: true },
  // add seo title suffix ssh.studio
  app: {
    head: {
      titleTemplate: '%s | ssh.studio',
      title: 'ssh.studio',
    },
  },
  css: ['~/assets/css/main.css', '~/assets/css/xterm.css'],
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'bun',
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
