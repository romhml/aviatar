import type { RouterInput, RouterOutput } from '@/server/trpc/routers'

type AvatarState = {
  history: RouterOutput['avatar']['generate'][]
  generateTask: any
}

export const useAvatar = defineStore('avatar', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: () =>
    ({
      history: [],
      currentModel: 'barbie',
      generateTask: null,
    }) as AvatarState,

  actions: {
    async generate(input: RouterInput['avatar']['generate']) {
      const { $client } = useNuxtApp()

      const generateTask = await $client.avatar.generate.mutate(input)
      this.history.unshift({ ...generateTask, input })

      await this.getGenerateResult(generateTask)
    },

    async getGenerateResult(generateTask: RouterOutput['avatar']['generate']) {
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
        task = await $client.avatar.generateTaskStatus.query(task.id)
      }

      const index = this.history.findIndex((t) => t.id === task.id)
      this.history[index] = task
    },

    async removeBackground(input: { image: string }) {
      const { $client } = useNuxtApp()

      return await $client.avatar.removeBackground.mutate(input)
    },

    // Resolve pending tasks
    async resolvePendingTasks() {
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
