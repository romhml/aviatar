<script setup lang="ts">
import { Model } from '@/models'

defineProps<{
  modelValue: string
  options: Model[]
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <div v-for="model in options" :key="model.name"
      class="flex cursor-pointer cursor-pointer select-none flex-col items-center justify-center space-y-2 rounded border-4 border-transparent transition duration-100 ease-in-out"
      :class="{
        'border-cyan-400 bg-cyan-400 shadow-2xl': modelValue === model.key,
      }" @click="emit('update:modelValue', model.key)">
      <img :src="model.picture" class="pointer-events-none h-40 w-40 rounded object-cover" />
    </div>
  </div>
</template>
