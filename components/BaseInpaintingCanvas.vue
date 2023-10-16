<script setup lang="ts">
import { Canvas, PencilBrush, Image, Path } from 'fabric'

const props = defineProps<{
  image: string
}>()

const canvas = ref<Canvas>()
const img = ref<Image>()

// Function to set up the canvas context
onMounted(async () => {
  canvas.value = new Canvas('canvas', {
    isDrawingMode: false,
    selection: false,
    stopContextMenu: true,
    skipTargetFind: true,
  })
  canvas.value.freeDrawingBrush = new PencilBrush(canvas.value)
  canvas.value.freeDrawingBrush.width = 20
  canvas.value.freeDrawingBrush.color = 'black'

  await updateImage()
})

async function updateImage() {
  if (!canvas.value) return
  if (img.value) {
    try {
      img.value?.dispose()
    } catch (e) {
      console.error(e)
    }
  }

  img.value = await Image.fromURL(props.image, {}, {})
  img.value.scaleToWidth(canvas.value.width)

  canvas.value.setDimensions({
    width: img.value?.width * img.value?.scaleX,
    height: img.value?.height * img.value?.scaleY,
  })
  canvas.value?.add(img.value)
}

watch(
  () => props.image,
  async () => {
    await updateImage()
  },
)

onUnmounted(() => {
  canvas.value?.dispose()
})

defineExpose({
  async clear() {
    canvas.value?.getObjects().forEach((o) => {
      if (o instanceof Path) {
        canvas.value?.remove(o)
      }
    })
  },

  async getMask() {
    const canvasData = canvas.value?.toJSON()

    // Invert drawing stroke and fill colors
    const invertedStrokes = canvasData.objects
      ?.filter((o: any) => o.type === 'Path')
      .map((o: any) => {
        return { ...o, stroke: 'white', fill: 'white' }
      })

    if (!invertedStrokes.length) return

    // Create a temporary canvas to generate the mask
    const invertedCanvas = new Canvas('inverted-canvas', {
      isDrawingMode: true,
      width: canvas.value?.width,
      height: canvas.value?.height,
    })

    await invertedCanvas.loadFromJSON({ objects: invertedStrokes }, () => {
      invertedCanvas.renderAll()
    })

    invertedCanvas.backgroundColor = 'black'

    // Export the inverted canvas as a base64 data URL
    const dataURL = invertedCanvas.toDataURL()
    invertedCanvas.dispose()

    return dataURL
  },

  async getImage() {
    return img.value?.toDataURL()
  },

  getWidth() {
    return canvas.value?.width
  },

  getHeight() {
    return canvas.value?.height
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
  <canvas
    id="canvas"
    class="rounded"
  />
</template>
