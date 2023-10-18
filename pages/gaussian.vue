<script setup>
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'

const prompt = ref()
const container = ref()

onMounted(() => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)

  const scene = new THREE.Scene()
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20,
  )

  const controls = new OrbitControls(camera, renderer.domElement)
  container.value.appendChild(renderer.domElement)

  const geo = new THREE.PlaneGeometry(2000, 2000, 8, 8)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  })

  const plane = new THREE.Mesh(geo, mat)
  plane.rotateX(-Math.PI / 2)
  scene.add(plane)

  const light = new THREE.AmbientLight(0x404040) // soft white light
  scene.add(light)

  const mtloader = new MTLLoader()
  mtloader.load('/dev/image.mtl', function (materials) {
    materials.preload()
    const loader = new OBJLoader()

    loader.setMaterials(materials)
    loader.load('/dev/image.obj', function (object) {
      object.scale.setScalar(100)
      scene.add(object)
    })
  })

  camera.position.z = 0
  controls.update()
  renderer.render(scene, camera)
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<template>
  <div class="flex flex-col items-center overflow-visible py-4">
    <div
      ref="container"
      class="h-80 w-80 overflow-hidden rounded bg-zinc-100"
    />

    <BasePrompt
      v-model="prompt"
      class="my-8 w-full max-w-md"
    />
  </div>
</template>
