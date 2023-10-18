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

// Function to process the image dimensions
function normalizeImageDimensions(width: number, height: number) {
  let targetWidth = width
  let targetHeight = height

  const aspectRatio = width / height

  // Calculate new dimensions that preserve aspect ratio
  if (width < 512 || height < 512) {
    if (aspectRatio > 1) {
      // Landscape orientation
      targetWidth = 512
      targetHeight = Math.round(targetWidth / aspectRatio)
    } else {
      // Portrait orientation
      targetHeight = 512
      targetWidth = Math.round(targetHeight * aspectRatio)
    }
  }

  // Ensure the dimensions are divisible by 8,
  targetWidth = targetWidth - (targetWidth % 8) + 8
  targetHeight = targetHeight - (targetHeight % 8) + 8

  return { width: targetWidth, height: targetHeight }
}

export const diffusionRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const model = input.model
      ? diffusionModels[input.model]
      : diffusionModels['sdxl']

    const { width, height } = normalizeImageDimensions(
      input.width,
      input.height,
    )

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
        prompt_strength: 0.5,
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
