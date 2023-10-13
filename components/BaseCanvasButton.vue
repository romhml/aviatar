<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

<template>
  <button
    class="text-white/60 hover:text-white text-sm transition hover:bg-white/20 p-1 rounded flex items-center justify-center"
  >
    <Icon :name="icon" class="w-4 h-4" />
  </button>
</template>
