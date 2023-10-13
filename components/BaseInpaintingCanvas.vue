<script setup lang="ts">
import { ref, onMounted, readonly } from 'vue'

const isDrawing = ref(false)
const canvas = ref<HTMLCanvasElement>()
const context = ref<CanvasRenderingContext2D | null>()
const dirty = ref(false)

let lastPoint = { x: 0, y: 0 }

// Function to set up the canvas context
onMounted(() => {
  if (!canvas.value) {
    throw new Error('Canvas is not defined')
  }

  // Set the canvas's internal size to match its display size
  const rect = canvas.value.getBoundingClientRect()
  canvas.value.width = rect.width
  canvas.value.height = rect.height

  context.value = canvas.value.getContext('2d')
  if (!context.value) {
    throw new Error('Canvas context is not defined')
  }
  // Set up the context for a blur effect
  context.value.lineWidth = 20 // This will be the "size" of the blur effect
})

function drawLine(
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  dirty.value = true
  if (!context.value) return

  const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }

  context.value.beginPath()
  context.value.moveTo(midPoint.x, midPoint.y)
  context.value.quadraticCurveTo(start.x, start.y, midPoint.x, midPoint.y) // Draw a quadratic bezier curve

  context.value.stroke()
  context.value.closePath()
}

function onMouseDown(e: MouseEvent) {
  if (!context.value || !canvas.value) return
  isDrawing.value = true
  const rect = canvas.value.getBoundingClientRect()

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  context.value.moveTo(x, y) // Move the drawing cursor to the start point
  lastPoint = { x, y } // Set the initial point for drawing
}

function onMouseUp() {
  if (!context.value) return

  isDrawing.value = false
  context.value.closePath() // Close the path for the current drawing session

  lastPoint = { x: 0, y: 0 }
}

function onMouseMove(e: MouseEvent) {
  if (!context.value || !canvas.value) return

  if (isDrawing.value) {
    const rect = canvas.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    drawLine(lastPoint, { x, y })
    lastPoint = { x, y }
  }
}

defineExpose({
  async clear() {
    if (!context.value || !canvas.value) return
    context.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    dirty.value = false
  },

  getMask() {
    if (!canvas.value || !context.value) return null

    // Remember the current settings
    const prevShadowBlur = context.value.shadowBlur
    const prevShadowColor = context.value.shadowColor

    // Temporarily disable the shadow (blur effect)
    context.value.shadowBlur = 0
    context.value.shadowColor = 'transparent'

    // Create an off-screen canvas
    const offScreenCanvas = document.createElement('canvas')
    offScreenCanvas.width = canvas.value.width
    offScreenCanvas.height = canvas.value.height
    const offScreenContext = offScreenCanvas.getContext('2d')

    if (!offScreenContext) {
      console.error('Off-screen canvas context is not available')
      return null
    }

    offScreenContext.filter = 'invert(1)'
    // Draw the original canvas onto the off-screen canvas
    offScreenContext.drawImage(canvas.value, 0, 0)

    // Invert the colors on the off-screen canvas
    offScreenContext.globalCompositeOperation = 'difference' // This mode inverts the color
    offScreenContext.fillStyle = 'white' // Use white color for the inversion effect
    offScreenContext.fillRect(
      0,
      0,
      offScreenCanvas.width,
      offScreenCanvas.height,
    )

    offScreenCanvas.remove()

    // Restore the previous settings
    context.value.shadowBlur = prevShadowBlur
    context.value.shadowColor = prevShadowColor

    // Return the data URL of the off-screen canvas
    return offScreenCanvas.toDataURL('image/png')
  },

  dirty: readonly(dirty),
})
</script>

<template>
  <canvas
    ref="canvas"
    class="bg-transparent transition duration-100"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseleave="onMouseUp"
  />
</template>
