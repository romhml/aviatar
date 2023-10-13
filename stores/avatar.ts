type AvatarState = {
  history: string[]
  currentVersion: number
}

export const useAvatar = defineStore('avatar', {
  state: () =>
    ({
      history: [],
      currentVersion: 0,
    }) as AvatarState,

  getters: {
    avatar: (state) => state.history[state.currentVersion],
  },

  actions: {
    async generate(input: { prompt: string; mask?: string; avatar?: string }) {
      const { $client } = useNuxtApp()
      let prediction = await $client.avatar.generate.mutate(input)

      const maxTries = 30
      let tries = 0
      while (tries < maxTries) {
        tries += 1

        if (prediction.status === 'succeeded') {
          const output = prediction.output as string[]

          this.history.unshift(output[0])
          break
        }

        if (prediction.status === 'failed') {
          throw new Error('Generation failed')
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
        prediction = await $client.avatar.generateStatus.query(prediction.id)
      }
    },
  },
})
