type AvatarState = {
  history: string[]
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
    async generate(input: {
      prompt: string
      mask?: string
      image?: string
      model?: string
      width: number
      height: number
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
          this.history.unshift(output[0])
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

    async removeBackground(input: { image: string }) {
      const { $client } = useNuxtApp()
      return await $client.avatar.removeBackground.mutate(input)
    },
  },
})
