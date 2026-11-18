import * as THREE from 'three'
import { DECORATIONS } from '../catalog/decorations'
import { createDecorPreviewMesh } from '../scene/meshes'

const cache = new Map<string, string>()
let renderer: THREE.WebGLRenderer | null = null

function getRenderer() {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(1)
    renderer.setSize(160, 160, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
  }
  return renderer
}

export function getDecorPreviewUrl(defId: string): string {
  const hit = cache.get(defId)
  if (hit) return hit

  const def = DECORATIONS.find((d) => d.id === defId)
  if (!def) return ''

  const r = getRenderer()
  const scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight(0xfff4e8, 1.0))
  const key = new THREE.DirectionalLight(0xffe8d2, 1.3)
  key.position.set(2.2, 3.2, 4.2)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.5)
  fill.position.set(-2, 1.5, -1)
  scene.add(fill)

  const mesh = createDecorPreviewMesh(def, false)
  scene.add(mesh)

  const box = new THREE.Box3().setFromObject(mesh)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  mesh.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z, 0.2)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20)
  camera.position.set(maxDim * 1.4, maxDim * 0.85, maxDim * 1.8)
  camera.lookAt(0, 0, 0)

  r.setClearColor(0x000000, 0)
  r.render(scene, camera)
  const url = r.domElement.toDataURL('image/png')
  cache.set(defId, url)

  // dispose lightweight scene bits
  scene.traverse((obj) => {
    const m = obj as THREE.Mesh
    if (m.isMesh) {
      m.geometry?.dispose()
      const mat = m.material
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else (mat as THREE.Material | undefined)?.dispose()
    }
  })

  return url
}

export function warmPreviewCache() {
  for (const def of DECORATIONS) getDecorPreviewUrl(def.id)
}
