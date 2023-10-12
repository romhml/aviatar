import { inferAsyncReturnType } from '@trpc/server'
import { H3Event } from 'h3'

export async function createContext(_event: H3Event) {
  return {}
}

export type Context = inferAsyncReturnType<typeof createContext>
