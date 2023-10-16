type AvatarState = {
  history: string[]
  currentVersion: number
  generateTask: any
}

export const useAvatar = defineStore('avatar', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: () =>
    ({
      history: [],
      currentVersion: 0,
      currentModel: 'barbie',
      generateTask: null,
    }) as AvatarState,

  getters: {
    avatar: (state) => state.history[state.currentVersion],
  },

  actions: {
    async generate(input: {
      prompt: string
      mask?: string
      avatar?: string
      model?: string
    }) {
      const { $client } = useNuxtApp()
      this.generateTask = await $client.avatar.generate.mutate(input)
      await this.getGenerateResult()
    },

    async getGenerateResult() {
      const { $client } = useNuxtApp()

      const maxTries = 30
      let tries = 0
      while (tries < maxTries) {
        tries += 1

        if (this.generateTask.status === 'succeeded') {
          const output = this.generateTask.output as string[]
          this.history.push(output[0])
          this.generateTask = null

          break
        }

        if (this.generateTask.status === 'failed') {
          throw new Error('Generation failed')
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
        this.generateTask = await $client.avatar.generateTaskStatus.query(
          this.generateTask.id,
        )
      }
    },
  },
})
