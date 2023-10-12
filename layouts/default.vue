<template>
  <div
    class="min-h-screen w-screen overflow-scroll flex flex-col justify-between bg-zinc-50"
  >
    <div class="max-w-screen-xl px-8">
      <slot />
    </div>
    <TheFooter />
  </div>
</template>
