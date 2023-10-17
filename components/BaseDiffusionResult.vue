<script setup lang="ts">
import type { Status } from 'replicate'

const props = defineProps<{
  status: Status
  image?: string
  mask?: string
  output?: string
  onLoad?: () => Promise<void>
}>()

async function download() {
  if (!props.output) return

  const a = document.createElement('a')
  const blob = await fetch(props.output).then((res) => res.blob())
  a.href = URL.createObjectURL(blob) ?? ''
  a.download = 'image.png'

  a.click()
  a.remove()
}

const hovered = ref(false)

onMounted(async () => {
  await props.onLoad?.()
})

onUnmounted(async () => {
  await props.onLoad?.()
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded shadow-xl"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <nuxt-img
      v-if="output"
      :src="output"
      class="h-full w-full"
      @load="onLoad"
    />

    <div
      v-else-if="image"
      class="relative h-full w-full overflow-hidden"
    >
      <nuxt-img
        :src="image"
        class="h-full w-full"
        @load="onLoad"
      />
      <BaseNoise class="absolute top-0" />
    </div>
    <div
      v-else
      class="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-black"
    >
      <BaseNoise class="absolute top-0" />
    </div>

    <Transition>
      <div
        v-if="hovered && props.output"
        class="absolute top-0 z-50 flex h-full w-full items-end justify-end bg-black/40 p-2"
      >
        <Icon
          name="heroicons:arrow-down-tray"
          class="h-5 w-5 cursor-pointer text-white"
          @click.prevent="download"
        />
      </div>
    </Transition>
  </div>
</template>
