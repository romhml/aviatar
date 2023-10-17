<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  loading?: boolean
  disabled?: boolean
}>()

const textarea = ref<HTMLTextAreaElement>()

const prompt = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const emit = defineEmits(['update:modelValue', 'generate'])
</script>

<template>
  <div
    class="flex items-center space-x-4 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 shadow-lg transition"
    :class="{ 'cursor-not-allowed opacity-50': loading || disabled }"
  >
    <input
      ref="textarea"
      v-model="prompt"
      class="w-full resize-none outline-none placeholder:text-zinc-300 disabled:cursor-not-allowed disabled:bg-white"
      placeholder="Imagine something..."
      :disabled="loading || disabled"
      @keydown.enter.exact="emit('generate')"
    />
    <button
      class="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-black text-white disabled:cursor-not-allowed"
      :class="{ 'animate-pulse': loading }"
      :disabled="loading || disabled"
      @click="emit('generate')"
    >
      <Transition mode="out-in">
        <Icon
          v-if="loading || disabled"
          name="humbleicons:spinner-earring"
          class="animate-spin"
        />
        <Icon
          v-else
          name="heroicons:arrow-right"
        />
      </Transition>
    </button>
  </div>
</template>
