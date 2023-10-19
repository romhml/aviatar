<script setup lang="ts">
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls'
// @ts-ignore
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import * as zip from '@zip.js/zip.js'

const props = defineProps<{ output: string }>()
const container = ref<HTMLElement>()

let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let controls: OrbitControls | null = null
let object: THREE.Object3D | null = null

const width = computed(() => container.value?.clientWidth || 0)
const height = computed(() => container.value?.clientHeight || 0)

function initScene() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.setSize(width.value, height.value)
  container.value?.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  const light = new THREE.PointLight(0xffffff, 200)
  light.castShadow = true
  light.position.set(0, 10, 3)
  scene.add(light)

  camera = new THREE.PerspectiveCamera(
    75,
    width.value / height.value,
    0.1,
    1000,
  )

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 32, 32)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)

  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  scene.add(plane)
}

async function unpackObj(url: string) {
  const blob = await fetch(url).then((res) => res.blob())

  const reader = new zip.ZipReader(new zip.BlobReader(blob))

  const entries = await reader.getEntries()
  const objFile = entries.find((entry) => entry.filename === 'logs/image.obj')
  const obj = await objFile?.getData!(new zip.TextWriter())

  const mtlFile = entries.find((entry) => entry.filename === 'logs/image.mtl')
  const mtl = await mtlFile?.getData!(new zip.TextWriter())
  const albedoFile = entries.find(
    (entry) => entry.filename === 'logs/image_albedo.png',
  )

  const albedo = await albedoFile?.getData!(new zip.Data64URIWriter())
  return { obj, mtl, albedo }
}

function renderObj(data: { obj?: string; mtl?: string; albedo?: string }) {
  if (!scene || !camera || !renderer) return
  if (object) scene.remove(object)

  const textureLoader = new THREE.TextureLoader()
  const albedoTexture = data.albedo
    ? textureLoader.load(data.albedo)
    : undefined

  // const mtlLoader = new MTLLoader()
  // const material = mtlLoader.parse(data.mtl)
  // material.preload()
  // for (const mtl of Object.values(material.materials)) {
  //   mtl.map = albedoTexture
  // }

  const material = new THREE.MeshStandardMaterial({ map: albedoTexture })

  const objLoader = new OBJLoader()
  object = objLoader.parse(data.obj)

  object?.traverse((child) => {
    if (child instanceof THREE.Mesh && child.isMesh) {
      child.material = material
    }
  })
  if (!object) return
  object.castShadow = true

  scene.add(object)
}

function focusObject() {
  if (!object || !camera) return

  const bbox = new THREE.Box3().setFromObject(object)
  object.position.y = -bbox.min.y + 0.1

  camera.position.y = -2 * bbox.min.y + 0.2
  camera.position.x = 1
  camera.position.z = 2 * bbox.max.z + 1

  controls.target.y = -bbox.min.y
}

onMounted(async () => {
  initScene()

  if (!camera || !renderer || !scene || !controls) {
    throw Error('Failed to initialize scene')
  }

  const objData = await unpackObj(props.output)
  renderObj(objData)

  watch(
    () => props.output,
    async () => {
      const objData = await unpackObj(props.output)
      renderObj(objData)
    },
  )

  console.log(object)
  focusObject()

  container.value?.addEventListener('resize', onWindowResize, false)

  function onWindowResize() {
    if (!renderer || !scene || !camera || !controls) return
    camera.aspect = width.value / height.value
    camera.updateProjectionMatrix()
    renderer.setSize(width.value, height.value)
    renderer.render(scene, camera)
  }

  const animate = () => {
    if (!renderer || !scene || !camera || !controls) return
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
