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
        mask: await canvas.value.getMask(),
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
          <BaseInpaintingCanvas
            ref="canvas"
            :image="picture"
            class="absolute h-full w-full border"
          />
          <Transition mode="in-out">
            <BaseNoise v-if="loading" />
          </Transition>
        </div>
      </div>

      <div
        v-else
        class="flex h-80 w-80 cursor-pointer items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-100"
        @click="loadFile"
      >
        <p class="text-center text-sm text-zinc-400">Upload your picture</p>
      </div>
    </Transition>

    <div
      class="mt-8 flex w-full max-w-md items-center space-x-4 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 shadow-lg transition"
      :class="{ 'cursor-not-allowed opacity-50': loading || !picture }"
      @keydown.enter="generate()"
    >
      <input
        v-model="prompt"
        :rows="1"
        class="w-full resize-none outline-none placeholder:text-zinc-300 disabled:bg-white"
        placeholder="Imagine something..."
        :disabled="loading || !picture"
      />
      <button
        class="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-black text-white"
        :class="{ 'animate-pulse': loading }"
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
    <p v-if="error" class="mt-2 text-sm text-red-500">
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
  transition: opacity 0.1s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
