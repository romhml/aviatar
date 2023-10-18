<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'

const props = defineProps<{
  obj?: string
  mat?: string
  albedo?: string
}>()

const container = ref()

onMounted(async () => {
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  const light = new THREE.PointLight(0xffffff, 200)
  light.castShadow = true
  light.position.set(0, 10, 3)
  scene.add(light)

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 32, 32)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)

  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  scene.add(plane)

  const albedoTexture = new THREE.TextureLoader().load(props.albedo)
  const mtlLoader = new MTLLoader()
  const material = await mtlLoader.parse(props.mat)
  material.preload()
  material.materials.defaultMat.map = albedoTexture

  const objLoader = new OBJLoader()
  objLoader.setMaterials(material)
  const object = await objLoader.parse(props.obj)

  const bbox = new THREE.Box3().setFromObject(object)
  object.position.y = -bbox.min.y + 0.1

  camera.position.y = -2 * bbox.min.y + 0.2
  camera.position.x = 1
  camera.position.z = 2 * bbox.max.z + 1

  controls.target.y = -bbox.min.y
  object.castShadow = true

  scene.add(object)

  container.value.addEventListener('resize', onWindowResize, false)

  function onWindowResize() {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.render(scene, camera)
  }

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<template>
  <div
    ref="container"
    class="overflow-hidden rounded bg-zinc-100"
  />
</template>
