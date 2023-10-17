<script setup lang="ts">
import { diffusionModels } from '@/server/models'
import MiniMasonry from 'minimasonry'

const diffusionStore = useDiffusion()

const canvas = ref()
const loading = ref(false)
const fileInput = ref()
const masonry = ref<MiniMasonry>()

const prompt = ref<string>()
const model = ref<string>('sdxl')
const error = ref()
const picture = ref<string>()

onMounted(async () => {
  masonry.value = new MiniMasonry({
    container: '.masonry',
    gutter: 10,
  })

  if (process.client) {
    loading.value = true
    await diffusionStore.resolvePendingTasks()
    loading.value = false
  }
})

async function generate() {
  if (loading.value) return
  loading.value = true
  error.value = undefined

  // Read picture as base64 string
  try {
    await diffusionStore.generate({
      model: model.value,
      prompt: prompt.value,
      mask: await canvas.value?.getMask(),
      image: await canvas.value?.getImage(),

      width: canvas.value?.getWidth(),
      height: canvas.value?.getHeight(),
    })
  } catch (err) {
    console.error(err)
    error.value = 'Something went wrong, please try again later.'
  }
  loading.value = false
}

async function removeBackground() {
  if (!picture.value || loading.value) return
  const { $client } = useNuxtApp()
  await canvas.value?.clear()

  loading.value = true
  const { output } = await $client.imageEdition.rembg.mutate({
    image: picture.value,
  })

  picture.value = output
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <BaseInputModelSelect
      v-model="model"
      :options="diffusionModels"
      :disabled="loading"
      class="mb-6"
    />

    <Transition mode="out-in">
      <div
        v-if="picture"
        class="flex flex-col items-center"
      >
        <BaseInpaintingCanvas
          ref="canvas"
          :image="picture"
        />
      </div>
    </Transition>

    <BaseInputFile
      ref="fileInput"
      v-model="picture"
      accept="image/png, image/jpg"
      :class="picture ? 'hidden' : ''"
    />

    <div class="mt-2 flex w-80 justify-between px-2">
      <div class="flex space-x-2">
        <BaseButtonIcon
          icon="heroicons:paint-brush"
          :active="canvas?.drawing"
          :disabled="!canvas"
          @click="canvas.toggleDrawing()"
        />
        <BaseButtonIcon
          icon="mdi:eraser"
          :disabled="!canvas || !canvas.dirty"
          @click="canvas.clear()"
        />
        <BaseButtonIcon
          icon="fluent:video-background-effect-32-filled"
          :disabled="!canvas"
          @click="removeBackground()"
        />
      </div>
      <div class="flex space-x-2">
        <BaseButtonIcon
          icon="heroicons:photo"
          @click="fileInput?.load()"
        />
      </div>
    </div>

    <BasePrompt
      v-model="prompt"
      class="mt-6 w-full max-w-md"
      :loading="loading"
      @generate="generate()"
    />
    <p
      v-if="error"
      class="mt-2 text-sm text-red-500"
    >
      {{ error }}
    </p>

    <div class="masonry relative mt-10 w-full">
      <ClientOnly>
        <div
          v-for="task in diffusionStore.history"
          :key="task.id"
          class="absolute transition"
        >
          <BaseDiffusionResult
            :status="task.status"
            :image="task.input?.image"
            :mask="task.input?.mask"
            :output="task.output?.length ? task.output[0] : undefined"
            :on-load="async () => masonry?.layout()"
          />
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="postcss">
* {
  @apply antialiased;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
