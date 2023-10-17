import { replicate } from '@/server/replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const removeBackgroundInput = z.object({
  image: z.string(),
})

export const imageEditionRouter = router({
  rembg: publicProcedure
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
