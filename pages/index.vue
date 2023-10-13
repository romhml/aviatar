<script setup lang="ts">
const avatarStore = useAvatar()

const canvas = ref()
const prompt = ref<string>('')
const loading = ref(false)
const picture = ref<string>()
const fileInput = ref<HTMLInputElement>()
const error = ref()

async function loadFile() {
  fileInput.value?.click()
}

// async function downloadMask() {
//   const mask = canvas.value.getMask()
//   const el = document.createElement('a')
//   el.href = mask
//   el.download = 'mask.png'
//   el.click()
//   el.remove()
// }
//
// async function downloadPicture() {
//   if (!picture.value) return
//
//   const el = document.createElement('a')
//   el.href = picture.value
//   el.download = 'picture.png'
//
//   el.click()
//   el.remove()
// }

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
  const reader = new FileReader()
  const blob = await fetch(picture.value as string).then((res) => res.blob())
  reader.readAsDataURL(blob)

  reader.onload = async () => {
    try {
      await avatarStore.generate({
        prompt: prompt.value,
        mask: canvas.value.dirty
          ? (canvas.value.getMask() as string)
          : undefined,
        avatar: reader.result as string,
      })
      picture.value = avatarStore.avatar
    } catch (err) {
      console.error(err)
      error.value = 'Something went wrong, please try again later.'
    }

    loading.value = false
    await canvas.value.clear()
  }
}
</script>

<template>
  <div class="flex flex-col items-center py-8">
    <Transition mode="out-in">
      <div v-if="picture" class="flex flex-col items-center">
        <div class="relative h-80 w-80 overflow-hidden">
          <img
            ref="pictureElement"
            :src="picture"
            class="absolute h-80 w-80 inset-0 select-none pointer-events-none rounded object-cover"
          />
          <BaseInpaintingCanvas ref="canvas" class="absolute w-full h-full" />
          <Transition mode="in-out">
            <BaseNoise v-if="loading" />
          </Transition>
        </div>
      </div>

      <div
        v-else
        class="bg-zinc-100 border border-dashed border-zinc-200 rounded w-80 h-80 cursor-pointer flex items-center justify-center"
        @click="loadFile"
      >
        <p class="text-center text-zinc-400 text-sm">Upload your picture</p>
      </div>
    </Transition>

    <div
      class="flex space-x-4 rounded-full bg-white pl-4 pr-2 py-2 border border-zinc-200 items-center w-full max-w-md shadow-lg mt-8 transition"
      :class="{ 'opacity-50 cursor-not-allowed': loading || !picture }"
      @keydown.enter="generate()"
    >
      <input
        v-model="prompt"
        :rows="1"
        class="outline-none resize-none w-full placeholder:text-zinc-300 disabled:bg-white"
        placeholder="Imagine something..."
        :disabled="loading || !picture"
      />
      <button
        class="rounded-full bg-black text-white w-7 h-7 flex items-center justify-center flex-none"
        :disabled="loading || !picture"
        @click="generate()"
      >
        <Transition mode="out-in">
          <Icon
            v-if="loading"
            name="humbleicons:spinner-earring"
            class="animate-spin"
          />
          <Icon v-else name="heroicons:arrow-right" />
        </Transition>
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-sm mt-2">
      {{ error }}
    </p>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/png image/jpg"
      @input="updatePicture"
    />
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease-in;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
