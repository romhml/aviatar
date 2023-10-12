import Replicate from 'replicate'
import { string, z } from 'zod'
import { publicProcedure, router } from '../trpc'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const generateInput = z.object({
  prompt: string(),
  avatar: string().optional(),
  mask: string().optional(),
})

export const avatarRouter = router({
  generate: publicProcedure.input(generateInput).mutation(async ({ input }) => {
    const output = await replicate.predictions.create(
      {
        version: '1bfb924045802467cf8869d96b231a12e6aa994abfe37e337c63a4e49a8c6c41',
        input: {
          prompt: input.prompt,
          image: input.avatar,
          mask: input.mask,
          width: 512,
          height: 512,
        },
      }
    )
    return output
  }),

  // Note: Would be better to use replicate webhooks and websockets but that's not currently possible with Nuxt
  generateStatus: publicProcedure.input(string()).query(async ({ input }) => {
    const output = await replicate.predictions.get(input)
    return output
  }),
})
