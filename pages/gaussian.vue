<script setup lang="ts">
const prompt = ref()
const loading = ref(false)
const output = ref('/dev/out.zip')
const error = ref()

const gaussianStore = useGaussian()

async function generate() {
  if (loading.value) return
  error.value = undefined
  loading.value = true

  // const generateTask = await $client.diffusion.generate.mutate({
  //   prompt: prompt.value,
  // })
  //
  // const { output: diffusionOutput } = await pollTask(generateTask)
  //
  // // Convert to base64
  // const blob = await fetch(diffusionOutput[0]).then((res) => res.blob())
  // const image = await new Promise<string>((resolve, reject) => {
  //   const reader = new FileReader()
  //   reader.onloadend = () => resolve(reader.result as string) // Resolve the promise with the base64 string
  //   reader.onerror = reject // Reject the promise on read error
  //   reader.readAsDataURL(blob) // Read the blob as data URL (base64)
  // })

  try {
    const result = await gaussianStore.generate({
      prompt: prompt.value,
    })

    console.log(output)
    output.value = result.output[0]
  } catch (err) {
    console.error(err)
    error.value = 'Something went wrong, please try again later.'
  }

  loading.value = false
}
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <BasePrompt
      v-model="prompt"
      class="mt-8 w-full max-w-md"
      :loading="loading"
      @generate="generate"
    />

    <div class="my-1 text-sm">
      <p
        v-if="error"
        class="text-red-500"
      >
        {{ error }}
      </p>
      <p v-else>&nbsp;</p>
    </div>

    <BaseGaussianResult
      class="mt-2 h-96 w-full max-w-md overflow-hidden rounded bg-zinc-100"
      :output="output"
    />
  </div>
</template>
