import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { diffusionRouter } from './diffusion'
import { imageEditionRouter } from './imageEditing'

export const appRouter = router({
  probe: publicProcedure.query(() => 'OK'),
  diffusion: diffusionRouter,
  imageEdition: imageEditionRouter,
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
