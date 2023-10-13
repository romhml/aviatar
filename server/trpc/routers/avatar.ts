import Replicate from 'replicate'
import { string, z } from 'zod'
import { publicProcedure, router } from '../trpc'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

type Model = {
  version: string
}

const models: Record<string, Model> = {
  inpaint: {
    version: 'c11bac58203367db93a3c552bd49a25a5418458ddffb7e90dae55780765e26d6',
  },
  vangogh: {
    version: '2d43b996608bd7d4aba4cacbe9b751399892a9d6cbc27a39f8f49347a3a16f9c',
  },
}

const generateInput = z.object({
  prompt: string(),
  avatar: string().nullish(),
  mask: string().nullish(),
  model: string().default('inpaint'),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = models[input.model] || models.inpaint

    const output = await replicate.predictions.create({
      version: model.version,
      input: {
        prompt: input.prompt,
        image: input.avatar,
        mask: input.mask,
        width: 512,
        height: 512,
      },
    })
    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  generateStatus: publicProcedure.input(string()).query(async ({ input }) => {
    const output = await replicate.predictions.get(input)
    return output
  }),
})
