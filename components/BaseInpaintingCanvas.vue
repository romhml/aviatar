<script setup lang="ts">
import { Canvas, PencilBrush } from 'fabric'

const props = defineProps<{
  image: string
}>()

const canvas = ref<Canvas>()
const container = ref<HTMLElement>()

// Function to set up the canvas context
onMounted(() => {
  canvas.value = new Canvas('canvas', {
    isDrawingMode: false,
    selection: false,
    stopContextMenu: true,
    skipTargetFind: true,

    width: container.value?.clientWidth,
    height: container.value?.clientHeight,
  })

  canvas.value.freeDrawingBrush = new PencilBrush(canvas.value)
  canvas.value.freeDrawingBrush.width = 20
  canvas.value.freeDrawingBrush.color = 'black'
})

onUnmounted(() => {
  canvas.value?.dispose()
})

defineExpose({
  async clear() {
    canvas.value?.clear()
  },

  async getMask() {
    const canvasData = canvas.value?.toJSON()
    if (!canvasData.objects.length) return

    // Invert drawing stroke and fill colors
    canvasData.objects?.forEach((object: any) => {
      object.stroke = 'white'
      object.fill = 'white'
    })

    // Create a temporary canvas to generate the mask
    const invertedCanvas = new Canvas('inverted-canvas', {
      isDrawingMode: true,
      width: container.value?.clientWidth,
      height: container.value?.clientHeight,
    })

    await invertedCanvas.loadFromJSON(canvasData, () => {
      invertedCanvas.renderAll()
    })

    invertedCanvas.backgroundColor = 'black'

    // Export the inverted canvas as a base64 data URL
    const dataURL = invertedCanvas.toDataURL()
    invertedCanvas.dispose()

    return dataURL
  },

  toggleDrawing() {
    if (!canvas.value) return
    canvas.value.isDrawingMode = !canvas.value?.isDrawingMode
  },

  drawing: computed(() => canvas.value?.isDrawingMode),

  undo() {
    if (!canvas.value) return
    const objects = canvas.value.getObjects()
    if (!objects.length) return

    canvas.value.remove(objects[objects.length - 1])
  },

  redo() {
    if (!canvas.value) return
    const objects = canvas.value.getObjects()
    if (!objects.length) return

    canvas.value.add(objects[objects.length - 1])
  },

  dirty: computed(() => {
    if (!canvas.value) return false
    const objects = canvas.value.getObjects()
    return !!objects.length
  }),
})
</script>

<template>
  <div
    ref="container"
    class="relative"
  >
    <nuxt-img
      :src="props.image"
      class="absolute rounded"
    />
    <canvas
      id="canvas"
      class="absolute"
    />
  </div>
</template>
