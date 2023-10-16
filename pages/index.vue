<script setup lang="ts">
import { models } from '@/models'
import MiniMasonry from 'minimasonry'

const avatarStore = useAvatar()

const canvas = ref()
const prompt = ref<string>('')
const model = ref<string>('sdxl')

const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
const error = ref()

const picture = ref<string>()
const masonry = ref<MiniMasonry>()

onMounted(async () => {
  masonry.value = new MiniMasonry({
    container: '.masonry',
    gutter: 10,
  })
})

async function uploadPicture() {
  fileInput.value?.click()
}

async function updatePicture(event: Event) {
  const file = (event.target as any).files[0]
  const reader = new FileReader()

  reader.readAsDataURL(file)
  reader.onload = () => {
    picture.value = reader.result as string
    canvas.value?.clear()
  }
  if (fileInput.value) fileInput.value.value = ''
}

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
  if (!picture.value) return
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
  <div class="flex flex-col items-center overflow-visible px-8 py-4">
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
        <div class="relative overflow-hidden rounded">
          <BaseInpaintingCanvas
            ref="canvas"
            :image="picture"
          />

          <Transition mode="in-out">
            <BaseNoise
              v-if="loading"
              class="absolute top-0"
            />
          </Transition>
        </div>
      </div>

      <div
        v-else
        class="flex h-80 w-80 cursor-pointer items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-100"
        @click="uploadPicture"
      >
        <p class="text-center text-sm text-zinc-400">Upload your picture</p>
      </div>
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
          @click="uploadPicture()"
        />
      </div>
    </div>

    <div
      class="mt-2 flex w-full max-w-md items-center space-x-4 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 shadow-lg transition"
      :class="{ 'cursor-not-allowed opacity-50': loading }"
    >
      <input
        v-model="prompt"
        class="w-full resize-none outline-none placeholder:text-zinc-300 disabled:cursor-not-allowed disabled:bg-white"
        placeholder="Imagine something..."
        :disabled="loading"
        @keydown.enter="generate()"
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
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/png, image/jpg"
      @input="updatePicture"
    />

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
          <div class="flex flex-wrap gap-4">
            <div
              v-for="img in avatarStore.history"
              :key="img"
              class="flex h-80 w-80 items-center justify-center rounded bg-zinc-100"
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
