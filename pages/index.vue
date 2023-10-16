<script setup lang="ts">
import { models } from '@/models'
const avatarStore = useAvatar()

const canvas = ref()
const prompt = ref<string>('')
const model = ref<string>('sdxl')

const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
const error = ref()
const picture = ref<string>()

async function uploadPicture() {
  fileInput.value?.click()
}

async function downloadPicture() {
  if (!picture.value) return

  const el = document.createElement('a')
  el.href = picture.value
  el.download = 'picture.png'

  el.click()
  el.remove()
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

  // Read picture as base64 string
  if (picture.value) {
    const reader = new FileReader()
    const blob = await fetch(picture.value as string).then((res) => res.blob())
    reader.readAsDataURL(blob)

    reader.onload = async () => {
      try {
        await avatarStore.generate({
          prompt: prompt.value,
          mask: await canvas.value?.getMask(),
          avatar: reader.result as string,
          model: model.value,
        })
      } catch (err) {
        console.error(err)
        error.value = 'Something went wrong, please try again later.'
      }
      loading.value = false
      await canvas.value.clear()
    }
  } else {
    await avatarStore.generate({
      prompt: prompt.value,
      mask: await canvas.value?.getMask(),
      model: model.value,
    })
    loading.value = false
  }
}
</script>

<template>
  <div>
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
          <div class="relative h-72 w-72 overflow-hidden">
            <BaseInpaintingCanvas
              ref="canvas"
              :image="picture"
              class="absolute h-full w-full"
            />
            <Transition mode="in-out">
              <BaseNoise v-if="loading" />
            </Transition>
          </div>
        </div>

        <div
          v-else
          class="flex h-72 w-72 cursor-pointer items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-100"
          @click="uploadPicture"
        >
          <p class="text-center text-sm text-zinc-400">Upload your picture</p>
        </div>
      </Transition>

      <div class="mt-2 flex w-72 justify-between">
        <div class="flex space-x-2">
          <BaseCanvasButton
            icon="heroicons:paint-brush"
            :active="canvas?.drawing"
            :disabled="!canvas"
            @click="canvas.toggleDrawing()"
          />
          <BaseCanvasButton
            icon="heroicons:arrow-path"
            :disabled="!canvas ?? !canvas?.dirty"
            @click="canvas.clear()"
          />
        </div>
        <div class="flex space-x-2">
          <BaseCanvasButton
            :disabled="!canvas"
            icon="heroicons:photo"
            @click="uploadPicture()"
          />
          <BaseCanvasButton
            :disabled="!canvas"
            icon="heroicons:arrow-down-tray"
            @click="downloadPicture()"
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
    </div>
    <ClientOnly>
      <Swiper
        class="mt-2 w-screen"
        slides-per-view="auto"
        :space-between="8"
        slide-to-clicked-slide
        centered-slides
        :initial-slide="avatarStore.history.length - 1"
      >
        <SwiperSlide
          v-for="img in avatarStore.history"
          :key="img"
          class="!h-60 !w-60"
        >
          <BaseOutputImage
            :src="img"
            class="h-60 w-60"
          />
        </SwiperSlide>
      </Swiper>
    </ClientOnly>
  </div>
</template>

<style>
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
