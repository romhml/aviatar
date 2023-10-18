<script setup lang="ts">
import type { Status } from 'replicate'
const props = defineProps<{
  status: Status
  image?: string
  mask?: string
  output?: string
  height: number
  width: number
}>()

const imageLoaded = ref(false)
const hovered = ref(false)

const onLoad = async () => {
  imageLoaded.value = true
}

async function download() {
  if (!props.output) return

  const a = document.createElement('a')
  const blob = await fetch(props.output).then((res) => res.blob())
  a.href = URL.createObjectURL(blob) ?? ''
  a.download = 'image.png'

  a.click()
  a.remove()
}

const aspectRatio = computed(() => (100 * props.height) / props.width)
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded shadow-xl"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div
      v-if="!imageLoaded"
      class="relative w-full overflow-hidden rounded"
      :style="{
        paddingTop: aspectRatio + '%',
      }"
    >
      <BaseNoise class="absolute top-0" />
    </div>

    <nuxt-img
      v-if="output"
      :src="output"
      class="h-full w-full"
      loading="eager"
      :hidden="!imageLoaded"
      @load="onLoad"
    />

    <div
      v-else-if="image"
      class="relative h-full w-full overflow-hidden"
      :hidden="!imageLoaded"
    >
      <nuxt-img
        :src="image"
        class="h-full w-full"
        loading="eager"
        @load="onLoad"
      />
      <BaseNoise class="absolute top-0" />
    </div>

    <Transition>
      <div
        v-if="imageLoaded && hovered && output"
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
