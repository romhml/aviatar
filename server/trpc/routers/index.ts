import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { diffusionRouter } from './diffusion'
import { imageEditionRouter } from './imageEditing'
import { gaussianRouter } from './gaussian'

export const appRouter = router({
  probe: publicProcedure.query(() => 'OK'),
  diffusion: diffusionRouter,
  gaussian: gaussianRouter,
  imageEdition: imageEditionRouter,
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
