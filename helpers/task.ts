import type { Prediction } from 'replicate'

export async function awaitTaskResult(initialTask: Prediction) {
  const { $client } = useNuxtApp()

  const maxTries = 100
  let tries = 0
  let task = initialTask

  while (tries < maxTries) {
    tries += 1
    task = await $client.task.get.query(task.id)
    if (task.status === 'succeeded') {
      break
    }

    if (task.status === 'failed' || task.status === 'canceled') {
      throw new Error('Generation failed')
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  if (tries === maxTries) {
    throw new Error('Generation timed out')
  }

  return task
}
