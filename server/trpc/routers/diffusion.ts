import { replicate } from '@/server/replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { diffusionModels } from '@/server/models'

const generateInput = z.object({
  prompt: z.string().nullish(),
  image: z.string().nullish(),
  mask: z.string().nullish(),
  model: z.string().optional(),
  height: z.number().default(512),
  width: z.number().default(512),
})

export const diffusionRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model
      ? diffusionModels[input.model]
      : diffusionModels['sdxl']

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
        height: height,
        width: width,
        num_inference_steps: 100,
      },
    })

    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  getTask: publicProcedure.input(z.string()).query(async ({ input }) => {
    const output = await replicate.predictions.get(input)
    return output
  }),
})
