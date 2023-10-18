import { replicate } from '@/server/replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const generateInput = z.object({
  image: z.string().nullish(),
  prompt: z.string().nullish(),
})

// Function to process the image dimensions
export const gaussianRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const output = await replicate.run(
      'alaradirik/dreamgaussian:44d1361ed7b4e46754c70de0d91334e79a1bc8bbe3e7ec18835691629de25305',
      {
        input: {
          prompt: input.prompt,
          image: input.image,
        },
      },
    )
    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  getTask: publicProcedure.input(z.string()).query(async ({ input }) => {
    const output = await replicate.predictions.get(input)
    return output
  }),
})
