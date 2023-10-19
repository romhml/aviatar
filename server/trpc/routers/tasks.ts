import { replicate } from '@/server/replicate'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

// Function to process the image dimensions
export const taskRouter = router({
  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await replicate.predictions.get(input)
  }),
})
