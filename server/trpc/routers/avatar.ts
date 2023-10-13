import Replicate from 'replicate'
import { string, z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { models } from '@/models'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const generateInput = z.object({
  prompt: string(),
  avatar: string().nullish(),
  mask: string().nullish(),
  model: string().optional(),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model ? models[input.model] : models['barbie']

    const output = await replicate.predictions.create({
      version: model.tag,
      input: {
        prompt: input.prompt,
        image: input.avatar,
        mask: input.mask,
        width: 512,
        height: 512,
        numInferenceSteps: 200,
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
