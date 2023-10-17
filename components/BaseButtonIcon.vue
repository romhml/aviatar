<script setup lang="ts">
defineProps<{
  icon: string
  active?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    class="flex items-center justify-center rounded p-1 transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-black text-white': active && !disabled,
      'text-black hover:bg-black/20': !active && !disabled,
    }"
    :disabled="disabled"
  >
    <Icon
      :name="icon"
      class="h-5 w-5"
    />
  </button>
</template>
