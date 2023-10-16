import Replicate from 'replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { models } from '@/models'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const generateInput = z.object({
  prompt: z.string(),
  image: z.string().nullish(),
  mask: z.string().nullish(),
  model: z.string().optional(),
  height: z.number().default(512),
  width: z.number().default(512),
})

const removeBackgroundInput = z.object({
  image: z.string(),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model ? models[input.model] : models['sdxl']

    // Note: Images must be divisible by 8
    let width = input.width - (input.width % 8)
    let height = input.height - (input.height % 8)
    // Upscale low resolution images
    if (width < 512) width = width * 2
    if (height < 512) height = height * 2

    const output = await replicate.predictions.create({
      version: model.tag,
      input: {
        prompt: input.prompt,
        negative_prompt: 'ugly, broken, disfigured, people',
        image: input.image,
        mask: input.mask,
        height: input.height - (input.height % 8),
        width: input.width - (input.width % 8),
      },
    })

    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  generateTaskStatus: publicProcedure
    .input(z.string())
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
