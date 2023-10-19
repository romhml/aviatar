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

    const result = await replicate.predictions.create({
      version: model.tag,
      input: {
        prompt: `${input.prompt}, ${model.promptSuffix}`,
        negative_prompt:
          'abstract (((watermark))) ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), wierd colors, blurry,  (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render ENSD: 31337',
        image: input.image,
        mask: input.mask,
        height,
        width,
        inference_steps: 25,
      },
    })

    return result
  }),
})
