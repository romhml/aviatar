<script setup lang="ts">
const props = defineProps<{
  src: string
}>()

async function download() {
  const a = document.createElement('a')
  const blob = await fetch(props.src).then((res) => res.blob())
  a.href = URL.createObjectURL(blob)
  a.download = 'image.png'

  a.click()

  a.remove()
}

const hovered = ref(false)
</script>

<template>
  <div
    class="relative cursor-pointer"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <img
      v-bind="$attrs"
      :src="src"
      class="rounded"
    />

    <Transition>
      <div
        v-if="hovered"
        class="absolute top-0 z-50 flex h-full w-full items-end justify-end rounded bg-black/40 p-2"
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
