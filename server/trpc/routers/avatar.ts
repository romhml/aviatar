import Replicate from 'replicate'
import { string, z } from 'zod'
import { publicProcedure, router } from '../trpc'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

type Model = {
  tag: string
  name?: string
}

const models: Record<string, Model> = {
  'stable-diffusion-inpainting': {
    tag: 'c11bac58203367db93a3c552bd49a25a5418458ddffb7e90dae55780765e26d6',
    name: 'stability-ai/stable-diffusion-inpainting',
  },
  'sdxl': {
    tag: 'c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316',
    name: 'stability-ai/sdxl',
  }
}

const generateInput = z.object({
  prompt: string(),
  avatar: string().nullish(),
  mask: string().nullish(),
  model: string().optional(),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model ? models[input.model] : input.mask ? models['stable-diffusion-inpainting'] : models['sdxl']

    const output = await replicate.predictions.create({
      version: model.tag,
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
