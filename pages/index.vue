<script setup lang="ts">
import { models } from '@/models'
import MiniMasonry from 'minimasonry'

const avatarStore = useAvatar()

const canvas = ref()
const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
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
      <BaseFileInput
        v-else
        ref="fileInput"
        v-model="picture"
        accept="image/png, image/jpg"
      />
    </Transition>
    <div class="mt-2 flex w-80 justify-between px-2">
      <div class="flex space-x-2">
        <BaseCanvasButton
          icon="heroicons:paint-brush"
          :active="canvas?.drawing"
          :disabled="!canvas || loading"
          @click="canvas.toggleDrawing()"
        />
        <BaseCanvasButton
          icon="mdi:eraser"
          :disabled="!canvas || !canvas?.dirty || loading"
          @click="canvas.clear()"
        />
        <BaseCanvasButton
          :disabled="!canvas || loading"
          icon="fluent:video-background-effect-32-filled"
          @click="removeBackground()"
        />
      </div>
      <div class="flex space-x-2">
        <BaseCanvasButton
          :disabled="!canvas || loading"
          icon="heroicons:photo"
          @click="fileInput?.click()"
        />
      </div>
    </div>

    <div
      class="mt-2 flex w-full max-w-md items-center space-x-4 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 shadow-lg transition"
      :class="{ 'cursor-not-allowed opacity-50': loading }"
    >
      <input
        v-model="prompt"
        href=""
        class="w-full resize-none outline-none placeholder:text-zinc-300 disabled:cursor-not-allowed disabled:bg-white"
        placeholder="Imagine something..."
        :disabled="loading"
        @keydown.enter.exact="generate()"
      />
      <button
        class="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-black text-white disabled:cursor-not-allowed"
        :class="{ 'animate-pulse': loading }"
        :disabled="loading"
        @click="generate()"
      >
        <Transition mode="out-in">
          <Icon
            v-if="loading"
            name="humbleicons:spinner-earring"
            class="animate-spin"
          />
          <Icon
            v-else
            name="heroicons:arrow-right"
          />
        </Transition>
      </button>
    </div>
    <p
      v-if="error"
      class="mt-2 text-sm text-red-500"
    >
      {{ error }}
    </p>

    <div class="masonry relative mt-6 w-full">
      <ClientOnly>
        <div
          v-for="img in avatarStore.history"
          :key="img"
          class="absolute"
        >
          <BaseOutputImage
            :src="img"
            @load="masonry?.layout()"
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
