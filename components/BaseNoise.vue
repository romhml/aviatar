<template>
  <div class="bg-noise" />
</template>

<style scoped>
.bg-noise {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  width: 200%;
  height: 200%;
  background: transparent url('/noise.png') repeat 0 0;
  background-repeat: repeat;
  background-size: 70%;
  animation: animation-noise 0.2s infinite ease-in-out;
  opacity: 0.9;
  visibility: visible;
}

@keyframes animation-noise {
  0% {
    transform: translate(0, 0);
  }

  10% {
    transform: translate(-5%, -5%);
  }

  20% {
    transform: translate(-10%, 5%);
  }

  30% {
    transform: translate(5%, -10%);
  }

  40% {
    transform: translate(-5%, 15%);
  }

  50% {
    transform: translate(-10%, 5%);
  }

  60% {
    transform: translate(15%, 0);
  }

  70% {
    transform: translate(0, 10%);
  }

  80% {
    transform: translate(-15%, 0);
  }

  90% {
    transform: translate(10%, 5%);
  }

  100% {
    transform: translate(5%, 0);
  }
}
</style>
