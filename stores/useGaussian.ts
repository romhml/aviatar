import type { RouterInput, RouterOutput } from '@/server/trpc/routers'
import type { Prediction } from 'replicate'

export type GaussianTask = Prediction & {
  input: { prompt: string }
  output: string[]
}

type GaussianState = {
  history: RouterOutput['gaussian']['generate'][]
}

export const useGaussian = defineStore('gaussian', {
  persist: {
    storage: persistedState.localStorage,
  },

  state: () => ({ history: [] }) as GaussianState,

  actions: {
    async generate(input: RouterInput['gaussian']['generate']) {
      const { $client } = useNuxtApp()

      const generateTask = await $client.gaussian.generate.mutate(input)
      this.history.unshift(generateTask as GaussianTask)

      try {
        const task = await awaitTaskResult(generateTask)
        return task
      } catch (e) {
        this.history = this.history.filter((t) => t.id !== generateTask.id)
        throw e
      }
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
          try {
            const _task = await awaitTaskResult(task)
            const index = this.history.findIndex((t) => t.id === task.id)
            this.history[index] = _task
          } catch (e) {
            this.history = this.history.filter((t) => t.id !== task.id)
            throw e
          }
        }),
      )
    },
  },
})
