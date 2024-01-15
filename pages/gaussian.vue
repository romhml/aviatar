<script setup lang="ts">
import * as zip from '@zip.js/zip.js'

const prompt = ref()
const loading = ref(false)
const picture = ref()

async function generate() {
  if (loading.value) return
  loading.value = true

  const { $client } = useNuxtApp()

  await $client.diffusion.generate.mutate({
    prompt: prompt.value,
  })

  await $client.gaussian.generate.mutate({
    prompt: prompt.value,
    image: picture.value,
  })

  loading.value = false
}

const object = ref()
const material = ref()
const albedo = ref()

onMounted(async () => {
  const file = '/dev/out.zip'
  const blob = await fetch(file).then((res) => res.blob())

  const reader = new zip.ZipReader(new zip.BlobReader(blob))
  reader.getEntries().then(async (entries) => {
    const obj = entries.find((entry) => entry.filename === 'logs/image.obj')
    object.value = await obj?.getData!(new zip.TextWriter())

    const mtl = entries.find((entry) => entry.filename === 'logs/image.mtl')
    console.log(mtl)
    material.value = await mtl?.getData!(new zip.TextWriter())

    const albed = entries.find(
      (entry) => entry.filename === 'logs/image_albedo.png',
    )
    albedo.value = await albed?.getData!(new zip.Data64URIWriter())
  })
})
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <BaseInputFile
      v-model="picture"
      accept="image/png, image/jpg"
    />

    <BasePrompt
      v-model="prompt"
      class="my-8 w-full max-w-md"
      :loading="loading"
      @generate="generate"
    />

    <BaseGaussianResult
      v-if="object && material && albedo"
      class="h-80 w-80 overflow-hidden rounded bg-zinc-100"
      :obj="object"
      :mat="material"
      :albedo="albedo"
    />
  </div>
</template>
