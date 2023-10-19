import { replicate } from '@/server/replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const generateInput = z.object({
  prompt: z.string().nullish(),
})

// Function to process the image dimensions
export const gaussianRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const result = await replicate.predictions.create({
      version:
        '44d1361ed7b4e46754c70de0d91334e79a1bc8bbe3e7ec18835691629de25305',
      input: {
        text: input.prompt,
        num_point_samples: 1000,
        num_steps: 100,
      },
    })

    return result
  }),
})
