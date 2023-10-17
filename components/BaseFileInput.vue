<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    accept: string
  }>(),
  {
    modelValue: undefined,
    accept: 'image/png, image/jpg',
  },
)

const emit = defineEmits(['update:modelValue'])

const fileInput = ref<HTMLInputElement>()

async function upload() {
  fileInput.value?.click()
}

async function onInput(event: Event) {
  const file = (event.target as any).files[0]
  const reader = new FileReader()

  reader.readAsDataURL(file)
  reader.onload = () => {
    emit('update:modelValue', reader.result)
  }
}
</script>

<template>
  <div>
    <div
      class="flex h-80 w-80 cursor-pointer items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-100"
      @click="upload"
    >
      <p class="text-center text-sm text-zinc-400">Upload your picture</p>
    </div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      @input="onInput"
    />
  </div>
</template>
