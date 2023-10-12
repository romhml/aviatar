import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { avatarRouter } from './avatar'

export const appRouter = router({
  probe: publicProcedure.query(() => 'OK'),
  avatar: avatarRouter,
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
