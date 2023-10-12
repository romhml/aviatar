<script setup lang="ts">
const canvas = ref()
const prompt = ref<string>('')
const loading = ref(false)
const picture = ref<string | undefined>()
const fileInput = ref<HTMLInputElement>()
const prediction = ref()

async function loadFile() {
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

  const { $client } = useNuxtApp()
  const reader = new FileReader()
  loading.value = true
  const blob = await fetch(picture.value as string).then((res) => res.blob())

  reader.readAsDataURL(blob)
  reader.onload = async () => {
    try {
      prediction.value = await $client.avatar.generate.mutate({
        prompt: prompt.value,
        mask: canvas.value.dirty ? canvas.value.getMask() : undefined,
        avatar: reader.result
      })

      await getGenerationResult()
    } catch (err) {
      console.error(err)
    }

    // await new Promise((resolve) => setTimeout(resolve, 1000))
    // const result = '/picture.jpeg'

    loading.value = false
    await canvas.value.clear()
  }
}

async function getGenerationResult() {
  const { $client } = useNuxtApp()

  while (true) {
    if (prediction.value?.status === 'succeeded') {
      picture.value = prediction.value?.output[0]
      prediction.value = undefined
      break
    }

    if (prediction.value?.status === 'failed') {
      prediction.value = undefined
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
    prediction.value = await $client.avatar.generateStatus.query(prediction.value?.id)
  }
}
</script>

<template>
  <div class="flex flex-col items-center py-8">
    <Transition mode="out-in">
      <div v-if="picture" class="flex flex-col items-center">
        <div class="relative w-80 h-80 overflow-hidden">
          <img ref="pictureElement" :src="picture" class="absolute inset-0 select-none pointer-events-none rounded" />
          <Canvas ref="canvas" class="absolute w-full h-full cursor-pointer" />
          <Transition mode="in-out">
            <div v-if="loading" class="bg" />
          </Transition>
        </div>
      </div>

      <div v-else
        class="bg-zinc-100 border border-dashed border-zinc-200 rounded w-80 h-80 cursor-pointer flex items-center justify-center"
        @click="loadFile">
        <p class="text-center text-zinc-400 text-sm">Upload your picture</p>
      </div>
    </Transition>

    <div
      class="flex space-x-4 rounded-full bg-white pl-4 pr-2 py-2 border border-zinc-200 items-center w-full max-w-md shadow-lg mt-8"
      @keydown.enter="generate()">
      <input v-model="prompt" :rows="1"
        class="outline-none resize-none w-full placeholder:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        placeholder="Imagine something..." :disabled="loading || !picture" />
      <button
        class="rounded-full bg-black text-white w-7 h-7 flex items-center justify-center flex-none disabled:opacity-50 disabled:cursor-not-allowed transition"
        @click="generate()" :disabled="loading || !picture">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      </button>
    </div>

    <Transition>
      <div v-if="picture && !loading" class="flex space-x-4 justify-between">
        <button v-if="picture" class="underline text-zinc-400 text-sm mt-4" @click="loadFile">
          Change
        </button>
        <button v-if="picture" class="underline text-zinc-400 text-sm mt-4" @click="canvas.clear()">
          Clear
        </button>
        <a v-if="picture" :href="picture" target="_blank" class="underline text-zinc-400 text-sm mt-4">Download</a>
      </div>
    </Transition>

    <input ref="fileInput" type="file" class="hidden" accept="image/png image/jpg" @input="updatePicture" />
  </div>
</template>

<style>
.bg {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  width: 200%;
  height: 200%;
  background: transparent url('/noise.png') repeat 0 0;
  background-repeat: repeat;
  animation: bg-animation 0.2s infinite ease-in-out;
  opacity: 0.9;
  visibility: visible;
}

@keyframes bg-animation {
  0% {
    transform: translate(0, 0);
  }

  10% {
    transform: translate(-5%, -5%);
  }

  20% {
    transform: translate(-10%, 5%);
  }

  30% {
    transform: translate(5%, -10%);
  }

  40% {
    transform: translate(-5%, 15%);
  }

  50% {
    transform: translate(-10%, 5%);
  }

  60% {
    transform: translate(15%, 0);
  }

  70% {
    transform: translate(0, 10%);
  }

  80% {
    transform: translate(-15%, 0);
  }

  90% {
    transform: translate(10%, 5%);
  }

  100% {
    transform: translate(5%, 0);
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
