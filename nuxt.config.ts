// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
  ],

  imports: {
    dirs: ['stores'],
  },
  build: {
    transpile: ['trpc-nuxt'],
  },

  runtimeConfig: {
    replicateApiToken: process.env.REPLICATE_API_TOKEN,
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
  },
})
