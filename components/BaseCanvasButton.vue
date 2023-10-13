<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

<template>
  <button
    class="flex items-center justify-center rounded p-1 text-sm text-white/60 transition hover:bg-white/20 hover:text-white"
  >
    <Icon :name="icon" class="h-4 w-4" />
  </button>
</template>
