<script setup>
const prompt = ref()
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <BasePrompt
      v-model="prompt"
      class="w-full max-w-md"
    />
  </div>
</template>
