<script setup lang="ts">
import { DiffusionModel } from '@/server/models'

const props = defineProps<{
  modelValue: string
  options: Record<string, DiffusionModel>
  disabled?: boolean
}>()

const menu = ref<HTMLElement>()
const currentModel = computed(() => props.options[props.modelValue])
const toggled = ref(false)

const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (props.disabled) return
  toggled.value = !toggled.value
}

function onUpdate(key: string) {
  emit('update:modelValue', key)
  toggled.value = false
}

onClickOutside(menu, () => {
  if (toggled.value) toggled.value = false
})
</script>

<template>
  <div class="relative">
    <div
      class="flex w-[15rem] items-center space-x-2 rounded-full border border-zinc-300 bg-white p-1 transition ease-in"
      :class="{
        'shadow-lg': toggled,
        'hover:shadow-lg': !toggled && !disabled,
        'cursor-not-allowed opacity-50': disabled,
        'cursor-pointer': !disabled,
      }"
      @click="toggle"
    >
      <img
        :src="currentModel.picture"
        class="pointer-events-none h-10 w-10 flex-none rounded-full object-cover transition"
      />
      <div class="w-full overflow-hidden pr-4 transition">
        <p class="text-sm font-medium transition">{{ currentModel?.label }}</p>
        <p
          class="truncate text-ellipsis text-sm font-medium text-zinc-500 transition"
        >
          {{ currentModel?.name }}
        </p>
      </div>
    </div>

    <Transition>
      <div
        v-if="toggled"
        ref="menu"
        class="absolute left-1/2 top-16 z-50 grid w-[20rem] -translate-x-1/2 transform grid-cols-2 gap-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 shadow-lg sm:w-[30rem] sm:grid-cols-3"
      >
        <div
          v-for="(model, key) in options"
          :key="model.name"
          class="flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-lg px-2 py-4 text-center transition hover:bg-zinc-100"
          @click="onUpdate(key)"
        >
          <nuxt-img
            :src="model.picture"
            class="pointer-events-none h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p class="text-sm font-medium">{{ model?.label }}</p>
            <p class="text-sm font-medium text-zinc-500">{{ model?.name }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
