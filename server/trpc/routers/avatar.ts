import Replicate from 'replicate'
import { string, z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { models } from '@/models'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const generateInput = z.object({
  prompt: string(),
  image: string().nullish(),
  mask: string().nullish(),
  model: string().optional(),
})

const removeBackgroundInput = z.object({
  image: string(),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model ? models[input.model] : models['barbie']

    const output = await replicate.predictions.create({
      version: model.tag,
      input: {
        prompt: input.prompt,
        negative_prompt: 'ugly, broken, disfigured, people',
        image: input.image,
        mask: input.mask,
        width: 512,
        height: 512,
        num_inference_steps: 100,
      },
    })

    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  generateTaskStatus: publicProcedure
    .input(string())
    .query(async ({ input }) => {
      const output = await replicate.predictions.get(input)
      return output
    }),

  removeBackground: publicProcedure
    .input(removeBackgroundInput)
    .mutation(async ({ input }) => {
      const output = await replicate.run(
        'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        {
          input: {
            image: input.image,
          },
        },
      )

      return { output: output as unknown as string }
    }),
})
