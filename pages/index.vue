<script setup lang="ts">
import { models } from '@/models'
import MiniMasonry from 'minimasonry'

const avatarStore = useAvatar()

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
    await useAvatar().resolvePendingTasks()
    loading.value = false
  }
})

async function generate() {
  if (loading.value) return
  loading.value = true
  error.value = undefined

  const image = await canvas.value?.getImage()

  // Read picture as base64 string
  try {
    await avatarStore.generate({
      prompt: prompt.value,
      mask: await canvas.value?.getMask(),
      image,
      model: model.value,
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
  await canvas.value?.clear()

  loading.value = true
  const { output } = await avatarStore.removeBackground({
    image: picture.value,
  })

  picture.value = output
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <BaseModelPicker
      v-model="model"
      :options="models"
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
    <BaseFileInput
      ref="fileInput"
      v-model="picture"
      accept="image/png, image/jpg"
      :class="picture ? 'hidden' : ''"
    />
    <div class="mt-2 flex w-80 justify-between px-2">
      <div class="flex space-x-2">
        <BaseCanvasButton
          icon="heroicons:paint-brush"
          :active="canvas?.drawing"
          :disabled="!canvas"
          @click="canvas.toggleDrawing()"
        />
        <BaseCanvasButton
          icon="mdi:eraser"
          :disabled="!canvas || !canvas.dirty"
          @click="canvas.clear()"
        />
        <BaseCanvasButton
          icon="fluent:video-background-effect-32-filled"
          :disabled="!canvas"
          @click="removeBackground()"
        />
      </div>
      <div class="flex space-x-2">
        <BaseCanvasButton
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
          v-for="task in avatarStore.history"
          :key="task.id"
          class="absolute transition duration-300 ease-in-out"
        >
          <BaseOutputImage
            :status="task.status"
            :image="task.input?.image"
            :mask="task.input?.mask"
            :output="task.output?.length ? task.output[0] : undefined"
            :on-load="async () => masonry?.layout()"
          />
        </div>
        <template #fallback>
          <div class="flex flex-wrap justify-center gap-4">
            <div
              v-for="i in 10"
              :key="i"
              class="flex h-80 w-80 animate-pulse items-center justify-center rounded bg-zinc-100"
            />
          </div>
        </template>
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
