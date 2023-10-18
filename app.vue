<script setup lang="ts">
useServerSeoMeta({
  title: 'Aviatar',
  description: 'Generate avatars using AI',
})
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="postcss">
* {
  @apply antialiased;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
