import type { RouterInput, RouterOutput } from '@/server/trpc/routers'

type AvatarState = {
  history: RouterOutput['diffusion']['generate'][]
}

export const useDiffusion = defineStore('diffusion', {
  persist: {
    storage: persistedState.localStorage,
  },

  state: () => ({ history: [] }) as AvatarState,

  actions: {
    async generate(input: RouterInput['diffusion']['generate']) {
      const { $client } = useNuxtApp()

      const generateTask = await $client.diffusion.generate.mutate(input)
      this.history.unshift({ ...generateTask, input })

      await this.getGenerateResult(generateTask)
    },

    async getGenerateResult(
      generateTask: RouterOutput['diffusion']['generate'],
    ) {
      const { $client } = useNuxtApp()

      const maxTries = 30
      let tries = 0
      let task = generateTask

      while (tries < maxTries) {
        tries += 1

        if (task.status === 'succeeded') {
          break
        }

        if (task.status === 'failed' || task.status === 'canceled') {
          this.history = this.history.filter((t) => t.id !== task.id)
          throw new Error('Generation failed')
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
        task = await $client.diffusion.getTask.query(task.id)
      }

      const index = this.history.findIndex((t) => t.id === task.id)
      this.history[index] = task
    },

    async removeBackground(input: { image: string }) {
      const { $client } = useNuxtApp()

      return await $client.diffusion.removeBackground.mutate(input)
    },

    // Resolve pending tasks
    async resolvePendingTasks() {
      // Remove invalid tasks
      this.history = this.history.filter((t) => !!t.status)

      const pendingTasks = this.history.filter(
        (t) => t.status === 'starting' || t.status === 'processing',
      )

      await Promise.all(
        pendingTasks.map(async (task) => {
          await this.getGenerateResult(task)
        }),
      )
    },
  },
})
