import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SoundManager } from './audio/SoundManager'
import { CATEGORY_LABELS, DECORATIONS, getDecor } from './catalog/decorations'
import { pickLevel } from './levels/parkLevel'
import {
  createCrowd,
  createDecorPreviewMesh,
  createLightStringMesh,
  createParkEnvironment,
  createTree,
} from './scene/meshes'
import { liftOffTreeSurface } from './scene/treeSurface'
import { scoreLayout } from './scoring/ScoreSystem'
import { setTheme, Theme } from './theme'
import { getDecorPreviewUrl, warmPreviewCache } from './ui/previewRenderer'
import type {
  DecorCategory,
  DecorDef,
  GamePhase,
  LevelConfig,
  PlacedDevice,
  PlacedOrnament,
  PlacedString,
  ScoreBreakdown,
} from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

export class Game {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  readonly raycaster = new THREE.Raycaster()
  readonly pointer = new THREE.Vector2()
  readonly audio = new SoundManager()
  private lastFrameTime = performance.now()

  level!: LevelConfig
  phase: GamePhase = 'intro'
  powered = false

  tree!: THREE.Group
  park!: THREE.Group
  crowd: THREE.Group | null = null
  decorRoot = new THREE.Group()
  deviceRoot = new THREE.Group()
  fxRoot = new THREE.Group()

  ornaments: PlacedOrnament[] = []
  strings: PlacedString[] = []
  devices: PlacedDevice[] = []

  ornamentMeshes = new Map<string, THREE.Object3D>()
  stringMeshes = new Map<string, THREE.Object3D>()
  deviceMeshes = new Map<string, THREE.Object3D>()

  selectedDef: DecorDef | null = null
  activeCategory: DecorCategory = 'baubles'

  // camera orbit
  camAngle = Math.PI * 0.25
  camRadius = 14.5
  camHeight = 5.0
  target = new THREE.Vector3(0, 3.1, 0)
  /** 垂直視角：對準高度（樹底～樹頂，範圍不大） */
  private readonly lookYMin = 0.7
  private readonly lookYMax = 5.6
  private readonly camYMin = 1.8
  private readonly camYMax = 7.2
  draggingCamera = false
  lastX = 0
  lastY = 0

  // light string editing
  stringDraftPoints: THREE.Vector3[] = []
  stringDraftMesh: THREE.Object3D | null = null

  // device editing
  selectedDeviceId: string | null = null
  draggingDevice = false

  // 樹頂／樹底編輯
  selectedPropId: string | null = null
  draggingProp = false

  // showcase
  showcaseT = 0
  showcaseDuration = 7
  pendingResult: ScoreBreakdown | null = null

  // particles
  snow: THREE.Points | null = null
  particleSystems: THREE.Points[] = []

  private raf = 0
  private canvas: HTMLCanvasElement
  private composer!: EffectComposer
  private bloomPass!: UnrealBloomPass
  private hemiLight!: THREE.HemisphereLight
  private dirLight!: THREE.DirectionalLight
  private ambientFill!: THREE.AmbientLight
  private festivalLights: THREE.Light[] = []
  private treeGlow: THREE.PointLight | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(Theme.sky)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = Theme.exposure

    this.scene.fog = new THREE.Fog(Theme.fog, 12, 34)
    this.decorRoot.name = 'decorRoot'
    this.deviceRoot.name = 'deviceRoot'
    this.fxRoot.name = 'fxRoot'
    this.scene.add(this.decorRoot, this.deviceRoot, this.fxRoot)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    // strength / radius / threshold：高 threshold + 小 radius，光暈貼在燈泡上不噴開
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      Theme.bloomStrength,
      Theme.bloomRadius,
      Theme.bloomThreshold,
    )
    this.composer.addPass(this.bloomPass)

    this.bindDom()
    this.bindInput()
    window.addEventListener('resize', () => this.resize())
    this.resize()
    warmPreviewCache()
    this.resetRound(false)
    this.loop()
  }

  private $(id: string) {
    return document.getElementById(id)!
  }

  private bindDom() {
    this.$('btn-start').onclick = () => this.startDecorate()
    this.$('btn-finish').onclick = () => this.beginShowcase()
    this.$('btn-retry').onclick = () => this.resetRound(true)
    this.$('btn-mute').onclick = () => {
      const muted = this.audio.toggleMute()
      this.$('btn-mute').textContent = muted ? '🔇' : '🔊'
      this.audio.ui()
    }
    this.$('btn-string-undo').onclick = () => this.undoStringNode()
    this.$('btn-string-done').onclick = () => this.completeStringTool()
    this.$('btn-rotate-ccw').onclick = () => this.rotateSelectedDevice(-Math.PI / 8)
    this.$('btn-rotate-cw').onclick = () => this.rotateSelectedDevice(Math.PI / 8)
    this.$('btn-device-delete').onclick = () => this.deleteSelectedDevice()
    this.$('btn-device-done').onclick = () => this.clearDeviceSelection()
    this.$('btn-prop-smaller').onclick = () => this.scaleSelectedProp(1 / 1.15)
    this.$('btn-prop-bigger').onclick = () => this.scaleSelectedProp(1.15)
    this.$('btn-prop-delete').onclick = () => this.deleteSelectedProp()
    this.$('btn-prop-done').onclick = () => this.clearPropSelection()
    this.$('btn-result-dock-left').onclick = () => this.dockResultCard('left')
    this.$('btn-result-dock-right').onclick = () => this.dockResultCard('right')
    this.$('btn-result-expand').onclick = () => this.expandResultCard()
  }

  private dockResultCard(side: 'left' | 'right') {
    const card = this.$('result-card')
    card.classList.add('docked', side === 'left' ? 'dock-left' : 'dock-right')
    card.classList.remove(side === 'left' ? 'dock-right' : 'dock-left')
    this.$('btn-result-expand').classList.remove('hidden')
    this.$('btn-result-dock-left').classList.add('hidden')
    this.$('btn-result-dock-right').classList.add('hidden')
    this.audio.ui()
  }

  private expandResultCard() {
    const card = this.$('result-card')
    card.classList.remove('docked', 'dock-left', 'dock-right')
    this.$('btn-result-expand').classList.add('hidden')
    this.$('btn-result-dock-left').classList.remove('hidden')
    this.$('btn-result-dock-right').classList.remove('hidden')
    this.audio.ui()
  }

  private bindInput() {
    const el = this.canvas
    const down = (x: number, y: number) => {
      this.lastX = x
      this.lastY = y
      this.updatePointer(x, y)
      if (this.phase !== 'decorate') return

      if (this.selectedDef?.kind === 'string') {
        if (this.hitTree()) this.placeStringNode()
        else this.draggingCamera = true
        return
      }

      if (this.selectedDef?.kind === 'device') {
        const deviceHit = this.hitDevice()
        if (deviceHit) {
          this.selectDevice(deviceHit)
          this.draggingDevice = true
          return
        }
        const ground = this.hitGround()
        if (ground) {
          this.placeOrSelectDevice()
          return
        }
        this.draggingCamera = true
        return
      }

      if (this.selectedDef && (this.selectedDef.kind === 'ornament' || this.selectedDef.kind === 'topper' || this.selectedDef.kind === 'base')) {
        const propHit = this.hitEditableProp()
        if (propHit && (this.selectedDef.kind === 'topper' || this.selectedDef.kind === 'base')) {
          this.selectProp(propHit)
          this.draggingProp = true
          return
        }
        // 點到樹上才放置；點空白處照常轉鏡頭
        if (this.selectedDef.kind === 'ornament') {
          if (this.hitTree()) this.placeOrnamentOrBase()
          else this.draggingCamera = true
          return
        }
        if (this.selectedDef.kind === 'base') {
          // 樹裙／火車不依賴地面點也可放（固定樹心）
          if (
            this.selectedDef.id === 'base_skirt' ||
            this.selectedDef.id === 'base_train' ||
            this.hitGround()
          ) {
            this.placeOrnamentOrBase()
          } else this.draggingCamera = true
          return
        }
        // topper：點樹或空白都可放／轉
        if (this.hitTree()) this.placeOrnamentOrBase()
        else this.draggingCamera = true
        return
      }

      const propHit = this.hitEditableProp()
      if (propHit) {
        this.clearDeviceSelection()
        this.selectProp(propHit)
        this.draggingProp = true
        return
      }

      const deviceHit = this.hitDevice()
      if (deviceHit) {
        this.clearPropSelection()
        this.selectDevice(deviceHit)
        this.draggingDevice = true
        return
      }

      this.draggingCamera = true
    }

    const move = (x: number, y: number) => {
      this.updatePointer(x, y)
      if (this.phase !== 'decorate') return

      if (this.draggingProp && this.selectedPropId) {
        this.dragSelectedProp()
        return
      }

      if (this.draggingDevice && this.selectedDeviceId) {
        const ground = this.hitGround()
        if (ground) this.moveSelectedDevice(ground)
        return
      }

      if (this.draggingCamera) {
        const dx = x - this.lastX
        const dy = y - this.lastY
        this.camAngle += dx * 0.005
        // 上下拖：小幅抬升／降低對準點，剛好掃到樹底～樹頂
        this.target.y = THREE.MathUtils.clamp(this.target.y + dy * 0.012, this.lookYMin, this.lookYMax)
        this.camHeight = THREE.MathUtils.clamp(this.target.y + 1.7, this.camYMin, this.camYMax)
        this.lastX = x
        this.lastY = y
      }
    }

    const up = () => {
      this.draggingCamera = false
      this.draggingDevice = false
      this.draggingProp = false
    }

    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId)
      down(e.clientX, e.clientY)
    })
    el.addEventListener('pointermove', (e) => move(e.clientX, e.clientY))
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  private updatePointer(x: number, y: number) {
    const rect = this.canvas.getBoundingClientRect()
    this.pointer.x = ((x - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((y - rect.top) / rect.height) * 2 + 1
  }

  private resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    this.bloomPass.setSize(w, h)
  }

  resetRound(fromResult: boolean) {
    this.level = pickLevel()
    setTheme(this.level.sceneId)
    this.phase = fromResult ? 'decorate' : 'intro'
    this.powered = false
    this.ornaments = []
    this.strings = []
    this.devices = []
    this.selectedDef = null
    this.selectedDeviceId = null
    this.selectedPropId = null
    this.stringDraftPoints = []
    this.pendingResult = null
    this.camAngle = Math.PI * 0.25
    this.camRadius = 14.5
    this.camHeight = 5.0
    this.target.set(0, 3.1, 0)

    // clear scene children except lights we rebuild
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]!)
    this.decorRoot = new THREE.Group()
    this.deviceRoot = new THREE.Group()
    this.fxRoot = new THREE.Group()
    this.crowd = null
    this.ornamentMeshes.clear()
    this.stringMeshes.clear()
    this.deviceMeshes.clear()
    this.particleSystems = []
    this.festivalLights = []
    this.treeGlow = null

    this.buildWorld()
    this.buildCatalog()
    this.updateToolbars()

    this.$('level-chip').textContent = this.level.name
    this.$('result-level').textContent = this.level.name
    this.$('intro').classList.toggle('hidden', this.phase !== 'intro')
    this.$('hud').classList.toggle('hidden', this.phase !== 'decorate')
    this.$('result').classList.add('hidden')

    if (fromResult) this.startDecorate()
  }

  private buildWorld() {
    this.renderer.setClearColor(Theme.sky)
    this.scene.fog = new THREE.Fog(Theme.fog, 20, 58)

    this.hemiLight = new THREE.HemisphereLight(Theme.hemiSky, Theme.hemiGround, 0.78)
    this.dirLight = new THREE.DirectionalLight(Theme.sun, 0.62)
    this.dirLight.position.set(5, 11, 3)
    this.ambientFill = new THREE.AmbientLight(Theme.fill, 0.48)
    const treeKey = new THREE.DirectionalLight(Theme.treeKey, 0.52)
    treeKey.position.set(-3, 8, 6)
    const moon = new THREE.PointLight(Theme.sun, 1.15, 36, 2)
    moon.position.set(-6, 10, -4)
    this.scene.add(this.hemiLight, this.dirLight, this.ambientFill, treeKey, moon)

    this.park = createParkEnvironment(this.level.sceneId)
    this.tree = createTree()
    this.scene.add(this.park, this.tree, this.decorRoot, this.deviceRoot, this.fxRoot)
    this.festivalLights = []
    this.treeGlow = null
    this.bloomPass.strength = Theme.bloomStrength
    this.bloomPass.radius = Theme.bloomRadius
    this.bloomPass.threshold = Theme.bloomThreshold
    this.renderer.toneMappingExposure = Theme.exposure

    // ambient snow（覆蓋更大場景）
    const snowGeo = new THREE.BufferGeometry()
    const count = 680
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 56
      pos[i * 3 + 1] = Math.random() * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 56
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.snow = new THREE.Points(
      snowGeo,
      new THREE.PointsMaterial({ color: 0xfff5e8, size: 0.05, transparent: true, opacity: 0.72 }),
    )
    this.fxRoot.add(this.snow)
  }

  private buildCatalog() {
    const tabs = this.$('catalog-tabs')
    const catalog = this.$('catalog')
    tabs.innerHTML = ''
    catalog.innerHTML = ''

    const cats: DecorCategory[] = ['lights', 'baubles', 'charms', 'toppers', 'base', 'devices']
    for (const cat of cats) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `tab${cat === this.activeCategory ? ' active' : ''}`
      btn.textContent = CATEGORY_LABELS[cat] ?? cat
      btn.onclick = () => {
        this.activeCategory = cat
        this.buildCatalog()
        this.audio.ui()
      }
      tabs.appendChild(btn)
    }

    for (const def of DECORATIONS.filter((d) => d.category === this.activeCategory)) {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = `item-card${this.selectedDef?.id === def.id ? ' selected' : ''}`
      const preview = getDecorPreviewUrl(def.id)
      card.innerHTML = `<img class="item-preview" src="${preview}" alt="${def.name}" draggable="false" /><span>${def.name}</span>`
      card.onclick = () => this.selectDef(def)
      catalog.appendChild(card)
    }
  }

  private selectDef(def: DecorDef) {
    // leaving string tool commits current draft
    if (this.selectedDef?.kind === 'string' && def.id !== this.selectedDef.id) {
      this.commitStringDraft()
    }
    this.clearDeviceSelection()
    this.clearPropSelection()
    this.selectedDef = this.selectedDef?.id === def.id ? null : def
    this.buildCatalog()
    this.updateToolbars()
    this.audio.ui()
  }

  private updateToolbars() {
    const stringOn = this.phase === 'decorate' && this.selectedDef?.kind === 'string'
    const deviceOn = this.phase === 'decorate' && !!this.selectedDeviceId
    const propOn = this.phase === 'decorate' && !!this.selectedPropId
    this.$('string-toolbar').classList.toggle('hidden', !stringOn)
    this.$('device-toolbar').classList.toggle('hidden', !deviceOn)
    this.$('prop-toolbar').classList.toggle('hidden', !propOn)
  }

  startDecorate() {
    this.phase = 'decorate'
    this.$('intro').classList.add('hidden')
    this.$('hud').classList.remove('hidden')
    this.$('result').classList.add('hidden')
    this.audio.ui()
  }

  private hitTree(): THREE.Intersection | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObject(this.tree, true)
    return hits.find((h) => (h.object as THREE.Object3D).userData.treeSurface) ?? hits[0] ?? null
  }

  /** 地面點：用 y=0 平面，不被樹幹／枝葉擋住；不再強制推到外圈 */
  private hitGround(): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = new THREE.Vector3()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    if (!this.raycaster.ray.intersectPlane(plane, hit)) return null
    hit.y = 0
    const dist = Math.hypot(hit.x, hit.z)
    if (dist > 10) {
      hit.multiplyScalar(10 / dist)
    }
    return hit
  }

  private hitDevice(): string | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObject(this.deviceRoot, true)
    if (!hits.length) return null
    let obj: THREE.Object3D | null = hits[0]!.object
    while (obj) {
      if (obj.userData.placedDeviceId) return obj.userData.placedDeviceId as string
      obj = obj.parent
    }
    return null
  }

  private placeOrnamentOrBase() {
    const def = this.selectedDef
    if (!def) return

    if (def.kind === 'topper') {
      for (const [id] of [...this.ornamentMeshes]) {
        if (getDecor(this.ornaments.find((x) => x.id === id)?.defId ?? '')?.kind === 'topper') {
          this.removeOrnament(id)
        }
      }
      const id = this.addOrnament(def, [0, 6.95, 0], undefined, 1)
      this.selectedDef = null
      this.buildCatalog()
      this.selectProp(id)
      this.audio.place()
      return
    }

    if (def.kind === 'base') {
      // 樹裙／繞樹火車：中心必須在樹幹，直接固定原點
      if (def.id === 'base_skirt' || def.id === 'base_train') {
        for (const [id] of [...this.ornamentMeshes]) {
          const existing = getDecor(this.ornaments.find((x) => x.id === id)?.defId ?? '')
          if (existing?.id === def.id) this.removeOrnament(id)
        }
        const id = this.addOrnament(def, [0, 0, 0], undefined, 1)
        this.selectedDef = null
        this.buildCatalog()
        this.selectProp(id)
        this.audio.place()
        return
      }
      const ground = this.hitGround() ?? new THREE.Vector3(0.9, 0, 0.6)
      const pos = this.clampBasePosition(ground, false)
      const id = this.addOrnament(def, [pos.x, 0, pos.z], undefined, 1)
      this.selectedDef = null
      this.buildCatalog()
      this.selectProp(id)
      this.audio.place()
      return
    }

    const hit = this.hitTree()
    if (!hit) return
    const faceN = hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0)
    faceN.transformDirection(hit.object.matrixWorld).normalize()
    // normal[0..2] 存「表面法線」供貼合推出；朝向另在 orient 內用徑向計算
    this.addOrnament(def, [hit.point.x, hit.point.y, hit.point.z], [faceN.x, faceN.y, faceN.z])
    this.audio.place()
  }

  /**
   * 飾品貼樹：
   * - 直立（Y 向上）＋正面大致朝外，方便辨識
   * - 位移沿「表面法線」緊貼樹表，避免水平外推造成浮空
   */
  private orientOrnamentOnTree(mesh: THREE.Object3D, hitPoint: THREE.Vector3, surfaceNormal: THREE.Vector3) {
    const surfaceN = surfaceNormal.clone().normalize()

    // 正面朝離樹心方向（略混法線），保持可讀
    const faceOut = new THREE.Vector3(hitPoint.x, 0, hitPoint.z)
    if (faceOut.lengthSq() < 1e-4) faceOut.set(surfaceN.x, 0, surfaceN.z)
    if (faceOut.lengthSq() < 1e-4) faceOut.set(0, 0, 1)
    faceOut.normalize()
    faceOut.lerp(surfaceN, 0.3).normalize()

    const worldUp = new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(worldUp, faceOut)
    if (right.lengthSq() < 1e-6) right.crossVectors(new THREE.Vector3(1, 0, 0), faceOut)
    right.normalize()
    const up = new THREE.Vector3().crossVectors(faceOut, right).normalize()
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, faceOut))

    // 用包圍球半徑沿表面法線推出，貼在樹皮上（不要用整盒角落，會被掛鉤／高帽撐太遠）
    mesh.position.copy(hitPoint)
    mesh.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(mesh)
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    // 球體中心約在幾何中心：推出約 0.5~0.65 倍半徑即可貼面
    const push = Math.min(0.18, Math.max(0.06, sphere.radius * 0.55))
    mesh.position.copy(hitPoint).addScaledVector(surfaceN, push)
  }

  private addOrnament(
    def: DecorDef,
    position: [number, number, number],
    normal?: [number, number, number],
    scale = 1,
  ): string {
    const id = uid()
    const mesh = createDecorPreviewMesh(def, false)

    if (normal && def.kind === 'ornament') {
      this.orientOrnamentOnTree(mesh, new THREE.Vector3(...position), new THREE.Vector3(...normal))
    } else {
      mesh.position.set(...position)
      if (def.kind === 'topper') mesh.quaternion.identity()
    }
    mesh.scale.setScalar(scale)

    const data: PlacedOrnament = {
      id,
      defId: def.id,
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      normal,
      scale,
    }
    this.ornaments.push(data)
    mesh.userData.placedOrnamentId = id
    this.decorRoot.add(mesh)
    this.ornamentMeshes.set(id, mesh)
    return id
  }

  private removeOrnament(id: string) {
    this.ornaments = this.ornaments.filter((o) => o.id !== id)
    const mesh = this.ornamentMeshes.get(id)
    if (mesh) {
      this.decorRoot.remove(mesh)
      this.ornamentMeshes.delete(id)
    }
  }

  private placeStringNode() {
    const def = this.selectedDef
    if (!def || def.kind !== 'string') return
    const hit = this.hitTree()
    if (!hit) return
    const n = hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0)
    n.transformDirection(hit.object.matrixWorld).normalize()
    // 先沿法線推出，再強制貼合樹外輪廓，避免弦線埋進樹內
    const raw = hit.point.clone().addScaledVector(n, 0.2)
    const p = liftOffTreeSurface(raw, 0.2)
    this.stringDraftPoints.push(p)
    this.refreshStringDraft(def)
    this.audio.stringNode()
  }

  private refreshStringDraft(def: DecorDef) {
    if (this.stringDraftMesh) {
      this.decorRoot.remove(this.stringDraftMesh)
      this.stringDraftMesh = null
    }
    if (!this.stringDraftPoints.length) return
    this.stringDraftMesh = createLightStringMesh(this.stringDraftPoints, def, false)
    this.decorRoot.add(this.stringDraftMesh)
  }

  private undoStringNode() {
    if (!this.stringDraftPoints.length) return
    this.stringDraftPoints.pop()
    if (this.selectedDef) this.refreshStringDraft(this.selectedDef)
    this.audio.undo()
  }

  private completeStringTool() {
    this.commitStringDraft()
    this.selectedDef = null
    this.buildCatalog()
    this.updateToolbars()
    this.audio.ui()
  }

  private commitStringDraft() {
    const def = this.selectedDef
    if (!def || def.kind !== 'string') {
      this.clearStringDraftVisual()
      return
    }
    if (this.stringDraftPoints.length >= 2) {
      const id = uid()
      const points = this.stringDraftPoints.map((p) => [p.x, p.y, p.z] as [number, number, number])
      this.strings.push({ id, defId: def.id, points })
      if (this.stringDraftMesh) {
        this.stringMeshes.set(id, this.stringDraftMesh)
        this.stringDraftMesh = null
      }
    } else {
      this.clearStringDraftVisual()
    }
    this.stringDraftPoints = []
  }

  private clearStringDraftVisual() {
    if (this.stringDraftMesh) {
      this.decorRoot.remove(this.stringDraftMesh)
      this.stringDraftMesh = null
    }
    this.stringDraftPoints = []
  }

  private placeOrSelectDevice() {
    const def = this.selectedDef
    if (!def || def.kind !== 'device') return

    const existing = this.hitDevice()
    if (existing) {
      this.selectDevice(existing)
      this.draggingDevice = true
      return
    }

    const ground = this.hitGround()
    if (!ground) return
    // 裝置仍避開樹幹碰撞圈
    const pos = ground.clone()
    const r = Math.hypot(pos.x, pos.z)
    const minR = 2.2
    if (r < minR) {
      if (r < 1e-6) pos.set(minR, 0, 0)
      else pos.multiplyScalar(minR / r)
    }
    pos.y = 0
    const id = uid()
    const yaw = Math.atan2(-pos.x, -pos.z)
    const data: PlacedDevice = { id, defId: def.id, position: [pos.x, 0, pos.z], yaw }
    this.devices.push(data)
    const mesh = createDecorPreviewMesh(def, false)
    mesh.position.copy(pos)
    mesh.rotation.y = yaw
    mesh.userData.placedDeviceId = id
    const arrow = mesh.getObjectByName('aimArrow')
    if (arrow) arrow.visible = true
    this.deviceRoot.add(mesh)
    this.deviceMeshes.set(id, mesh)
    this.selectDevice(id)
    this.audio.place()
  }

  private selectDevice(id: string) {
    this.selectedDeviceId = id
    this.clearPropSelection()
    for (const [did, mesh] of this.deviceMeshes) {
      const arrow = mesh.getObjectByName('aimArrow')
      if (arrow) arrow.visible = did === id
    }
    this.updateToolbars()
  }

  private clearDeviceSelection() {
    this.selectedDeviceId = null
    this.draggingDevice = false
    for (const mesh of this.deviceMeshes.values()) {
      const arrow = mesh.getObjectByName('aimArrow')
      if (arrow) arrow.visible = false
    }
    this.updateToolbars()
  }

  private hitEditableProp(): string | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObject(this.decorRoot, true)
    for (const h of hits) {
      let obj: THREE.Object3D | null = h.object
      while (obj) {
        const id = obj.userData.placedOrnamentId as string | undefined
        if (id) {
          const data = this.ornaments.find((o) => o.id === id)
          const kind = data ? getDecor(data.defId)?.kind : undefined
          if (kind === 'topper' || kind === 'base') return id
        }
        obj = obj.parent
      }
    }
    return null
  }

  private selectProp(id: string) {
    this.selectedPropId = id
    this.selectedDeviceId = null
    this.draggingDevice = false
    for (const mesh of this.deviceMeshes.values()) {
      const arrow = mesh.getObjectByName('aimArrow')
      if (arrow) arrow.visible = false
    }
    this.updateToolbars()
  }

  private clearPropSelection() {
    this.selectedPropId = null
    this.draggingProp = false
    this.updateToolbars()
  }

  private dragSelectedProp() {
    if (!this.selectedPropId) return
    const data = this.ornaments.find((o) => o.id === this.selectedPropId)
    const mesh = this.ornamentMeshes.get(this.selectedPropId)
    if (!data || !mesh) return
    const kind = getDecor(data.defId)?.kind
    if (kind === 'base') {
      const def = getDecor(data.defId)
      // 樹裙／火車鎖定樹幹中心，拖移不移位
      if (def?.id === 'base_skirt' || def?.id === 'base_train') {
        mesh.position.set(0, 0, 0)
        data.position = [0, 0, 0]
        return
      }
      const ground = this.hitGround()
      if (!ground) return
      const pos = this.clampBasePosition(ground, false)
      mesh.position.set(pos.x, 0, pos.z)
      data.position = [pos.x, 0, pos.z]
      return
    }
    if (kind === 'topper') {
      // 在樹頂附近水平拖移，高度固定在樹頂帶
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -6.5)
      const hit = new THREE.Vector3()
      if (!this.raycaster.ray.intersectPlane(plane, hit)) return
      const r = Math.hypot(hit.x, hit.z)
      const maxR = 0.85
      if (r > maxR) {
        hit.x = (hit.x / r) * maxR
        hit.z = (hit.z / r) * maxR
      }
      mesh.position.set(hit.x, 6.5 + Math.min(0.6, Math.max(0, 0.45 - r * 0.2)), hit.z)
      data.position = [mesh.position.x, mesh.position.y, mesh.position.z]
    }
  }

  private scaleSelectedProp(factor: number) {
    if (!this.selectedPropId) return
    const data = this.ornaments.find((o) => o.id === this.selectedPropId)
    const mesh = this.ornamentMeshes.get(this.selectedPropId)
    if (!data || !mesh) return
    const next = Math.min(2.6, Math.max(0.45, (data.scale ?? 1) * factor))
    data.scale = next
    mesh.scale.setScalar(next)
    this.audio.ui()
  }

  private deleteSelectedProp() {
    if (!this.selectedPropId) return
    this.removeOrnament(this.selectedPropId)
    this.clearPropSelection()
    this.audio.undo()
  }

  /** 禮盒等樹底：可到樹根旁，僅限制最大外圈 */
  private clampBasePosition(raw: THREE.Vector3, _preferCenter = false): THREE.Vector3 {
    const maxR = 3.0
    let x = raw.x
    let z = raw.z
    const r = Math.hypot(x, z)
    if (r > maxR && r > 1e-6) {
      const s = maxR / r
      x *= s
      z *= s
    }
    return new THREE.Vector3(x, 0, z)
  }

  private moveSelectedDevice(pos: THREE.Vector3) {
    const d = this.devices.find((x) => x.id === this.selectedDeviceId)
    const mesh = this.deviceMeshes.get(this.selectedDeviceId!)
    if (!d || !mesh) return
    // 大型裝置維持離樹幹一點距離，避免穿進樹根
    const clamped = pos.clone()
    const r = Math.hypot(clamped.x, clamped.z)
    const minR = 2.2
    const maxR = 10
    if (r < minR && r > 1e-6) {
      clamped.multiplyScalar(minR / r)
    } else if (r < 1e-6) {
      clamped.set(minR, 0, 0)
    } else if (r > maxR) {
      clamped.multiplyScalar(maxR / r)
    }
    clamped.y = 0
    d.position = [clamped.x, 0, clamped.z]
    mesh.position.set(clamped.x, 0, clamped.z)
  }

  private rotateSelectedDevice(delta: number) {
    const d = this.devices.find((x) => x.id === this.selectedDeviceId)
    const mesh = this.deviceMeshes.get(this.selectedDeviceId!)
    if (!d || !mesh) return
    d.yaw += delta
    mesh.rotation.y = d.yaw
    this.audio.ui()
  }

  private deleteSelectedDevice() {
    if (!this.selectedDeviceId) return
    const id = this.selectedDeviceId
    this.devices = this.devices.filter((d) => d.id !== id)
    const mesh = this.deviceMeshes.get(id)
    if (mesh) {
      this.deviceRoot.remove(mesh)
      this.deviceMeshes.delete(id)
    }
    this.clearDeviceSelection()
    this.audio.undo()
  }

  beginShowcase() {
    if (this.phase !== 'decorate') return
    this.commitStringDraft()
    this.selectedDef = null
    this.clearDeviceSelection()
    this.clearPropSelection()
    this.buildCatalog()
    this.updateToolbars()

    this.pendingResult = scoreLayout(this.level, this.ornaments, this.strings, this.devices)
    this.phase = 'showcase'
    this.showcaseT = 0
    this.powered = true
    this.powerOnAll()
    this.spawnPowerFx()
    this.spawnCrowd(this.pendingResult.popularity)
    // 展示：拉開距離看清大型地標與廣場
    this.camRadius = 22
    this.camHeight = 6.4
    this.target.set(0, 2.6, 0)
    this.$('hud').classList.add('hidden')
    this.audio.powerOn()
  }

  private spawnCrowd(popularity: number) {
    if (this.crowd) {
      this.scene.remove(this.crowd)
      this.crowd = null
    }
    this.crowd = createCrowd(popularity)
    this.scene.add(this.crowd)
  }

  private powerOnAll() {
    this.renderer.toneMappingExposure = Theme.exposure + 0.06
    // 範例圖：路燈／燈串有明顯暖光 bloom
    this.bloomPass.strength = Math.max(Theme.bloomStrength, 0.55)
    this.bloomPass.radius = 0.65
    this.bloomPass.threshold = 0.55
    this.hemiLight.intensity = 0.85
    this.ambientFill.intensity = 0.55
    this.dirLight.intensity = 0.65

    if (!this.treeGlow) {
      this.treeGlow = new THREE.PointLight(0xffd27a, 1.45, 6.2, 2.0)
      this.treeGlow.position.set(0, 3.4, 0)
      this.scene.add(this.treeGlow)
    } else {
      this.treeGlow.intensity = 1.45
    }

    // 路燈略亮，但不搶戲
    this.park.traverse((obj) => {
      if (obj.name !== 'streetLampHead') return
      const mesh = obj as THREE.Mesh
      const material = mesh.material as THREE.MeshStandardMaterial
      if (material?.emissive) {
        material.emissiveIntensity = Math.max(material.emissiveIntensity, 1.2)
        material.color.set(Theme.lampGlow)
      }
    })

    for (const [id, mesh] of this.ornamentMeshes) {
      const data = this.ornaments.find((o) => o.id === id)
      const def = data ? getDecor(data.defId) : undefined
      if (!def || !data) continue
      const lit = createDecorPreviewMesh(def, true)
      lit.position.copy(mesh.position)
      lit.quaternion.copy(mesh.quaternion)
      lit.scale.copy(mesh.scale)
      lit.userData.placedOrnamentId = id
      this.decorRoot.remove(mesh)
      this.decorRoot.add(lit)
      this.ornamentMeshes.set(id, lit)
    }
    for (const [id, mesh] of this.stringMeshes) {
      const data = this.strings.find((s) => s.id === id)
      const def = data ? getDecor(data.defId) : undefined
      if (!data || !def) continue
      const lit = createLightStringMesh(
        data.points.map((p) => new THREE.Vector3(...p)),
        def,
        true,
      )
      this.decorRoot.remove(mesh)
      this.decorRoot.add(lit)
      this.stringMeshes.set(id, lit)
    }
    for (const light of this.festivalLights) this.scene.remove(light)
    this.festivalLights = []

    for (const [id, mesh] of this.deviceMeshes) {
      const data = this.devices.find((d) => d.id === id)
      const def = data ? getDecor(data.defId) : undefined
      if (!data || !def) continue
      const lit = createDecorPreviewMesh(def, true)
      lit.position.set(...data.position)
      lit.rotation.y = data.yaw
      lit.userData.placedDeviceId = id
      // 保留裝置行為標記
      lit.userData.fxKind = lit.userData.fxKind ?? def.id.replace('dev_', '')
      lit.userData.emitsLight = lit.userData.emitsLight === true
      this.deviceRoot.remove(mesh)
      this.deviceRoot.add(lit)
      this.deviceMeshes.set(id, lit)
      // 不再對整組裝置 setPoweredEmissive（避免造雪機等被強行加自發光）

      // 只有真正的發光裝置才掛場景光源
      if (def.id === 'dev_spot') {
        const spot = new THREE.SpotLight(0xffe0a8, 3.0, 10, Math.PI / 7, 0.55, 1.35)
        spot.position.set(data.position[0], 1.1, data.position[2])
        const aim = new THREE.Object3D()
        aim.position.set(
          data.position[0] + Math.sin(data.yaw) * 3.2,
          2.4,
          data.position[2] + Math.cos(data.yaw) * 3.2,
        )
        this.scene.add(aim)
        spot.target = aim
        this.scene.add(spot)
        this.festivalLights.push(spot)
      } else if (def.id === 'dev_fire') {
        const fire = new THREE.PointLight(0xff8a3a, 1.4, 4.2, 2.1)
        fire.position.set(data.position[0], 0.9, data.position[2])
        this.scene.add(fire)
        this.festivalLights.push(fire)
      } else if (def.id === 'dev_sign') {
        const p = new THREE.PointLight(0xff8fa3, 0.95, 3.4, 2.1)
        p.position.set(data.position[0], 1.2, data.position[2])
        this.scene.add(p)
        this.festivalLights.push(p)
      } else if (def.id === 'dev_fountain') {
        const p = new THREE.PointLight(0xffd27a, 0.9, 3.2, 2.1)
        p.position.set(data.position[0], 1.0, data.position[2])
        this.scene.add(p)
        this.festivalLights.push(p)
      }
      // dev_snow / bubble / deer / speaker：不掛 PointLight
    }
  }

  private spawnPowerFx() {
    for (const d of this.devices) {
      const mesh = this.deviceMeshes.get(d.id)
      const kind = (mesh?.userData.fxKind as string) || d.defId.replace('dev_', '')
      if (!['snow', 'bubble', 'fountain', 'fire', 'speaker'].includes(kind)) continue

      const spout = mesh?.getObjectByName('fxSpout')
      const origin = new THREE.Vector3()
      if (spout) spout.getWorldPosition(origin)
      else origin.set(d.position[0], 0.9, d.position[2])

      const count = kind === 'snow' ? 280 : kind === 'bubble' ? 40 : 70
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      const vel = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        this.resetDeviceParticle(kind, d.yaw, origin, pos, vel, i)
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const color =
        kind === 'fire'
          ? 0xff8a3a
          : kind === 'fountain'
            ? 0xffd27a
            : kind === 'bubble'
              ? 0xd4c4ff
              : kind === 'speaker'
                ? 0xffd27a
                : 0xfff5e8
      const size = kind === 'bubble' ? 0.14 : kind === 'snow' ? 0.085 : 0.07
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color,
          size,
          transparent: true,
          opacity: kind === 'bubble' ? 0.55 : kind === 'snow' ? 0.92 : 0.85,
          depthWrite: false,
        }),
      )
      pts.userData.deviceFx = d
      pts.userData.fxKind = kind
      pts.userData.vel = vel
      pts.userData.origin = origin.clone()
      this.fxRoot.add(pts)
      this.particleSystems.push(pts)
    }
  }

  /** 依裝置類型初始化單顆粒子（雪：面向仰角 30~75°） */
  private resetDeviceParticle(
    kind: string,
    yaw: number,
    origin: THREE.Vector3,
    pos: Float32Array,
    vel: Float32Array,
    i: number,
  ) {
    const o = i * 3
    pos[o] = origin.x + (Math.random() - 0.5) * 0.08
    pos[o + 1] = origin.y + (Math.random() - 0.5) * 0.05
    pos[o + 2] = origin.z + (Math.random() - 0.5) * 0.08

    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw))
    if (kind === 'snow') {
      const pitch = THREE.MathUtils.degToRad(28 + Math.random() * 50) // 28~78°
      const spread = (Math.random() - 0.5) * 0.55
      const dir = new THREE.Vector3(
        forward.x * Math.cos(pitch) + Math.cos(yaw) * spread,
        Math.sin(pitch),
        forward.z * Math.cos(pitch) - Math.sin(yaw) * spread,
      ).normalize()
      const speed = 4.2 + Math.random() * 3.2
      vel[o] = dir.x * speed
      vel[o + 1] = dir.y * speed
      vel[o + 2] = dir.z * speed
    } else if (kind === 'bubble') {
      const pitch = THREE.MathUtils.degToRad(20 + Math.random() * 35)
      const dir = new THREE.Vector3(forward.x * Math.cos(pitch), Math.sin(pitch) + 0.2, forward.z * Math.cos(pitch)).normalize()
      const speed = 0.55 + Math.random() * 0.45
      vel[o] = dir.x * speed
      vel[o + 1] = dir.y * speed
      vel[o + 2] = dir.z * speed
    } else if (kind === 'fountain') {
      const ang = Math.random() * Math.PI * 2
      const up = 2.4 + Math.random() * 1.4
      vel[o] = Math.cos(ang) * 0.35
      vel[o + 1] = up
      vel[o + 2] = Math.sin(ang) * 0.35
    } else if (kind === 'fire') {
      vel[o] = (Math.random() - 0.5) * 0.4
      vel[o + 1] = 1.2 + Math.random() * 1.1
      vel[o + 2] = (Math.random() - 0.5) * 0.4
    } else {
      // speaker notes
      vel[o] = forward.x * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 0.2
      vel[o + 1] = 0.8 + Math.random() * 0.7
      vel[o + 2] = forward.z * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 0.2
    }
  }

  private finishShowcase() {
    this.phase = 'result'
    const result = this.pendingResult!
    this.expandResultCard()
    this.$('result').classList.remove('hidden')
    this.$('result-title').textContent = result.title
    this.$('result-power').textContent = `${result.powerDraw.toLocaleString('zh-Hant')} W`
    this.animateScore(result.popularity)
    const list = this.$('result-breakdown')
    list.innerHTML = ''
    const rows: [string, string][] = [
      ['場景貼合', String(result.sceneFit)],
      ['燈光配色', String(result.colorHarmony)],
      ['空間層次', String(result.spatialBalance)],
      ['裝置朝向', String(result.deviceAim)],
      ['豐富度', String(result.richness)],
      ['耗費電力', `${result.powerDraw.toLocaleString('zh-Hant')} W`],
    ]
    for (const [label, val] of rows) {
      const li = document.createElement('li')
      li.innerHTML = `<span>${label}</span><strong>${val}</strong>`
      list.appendChild(li)
    }
    if (result.combos.length) {
      const li = document.createElement('li')
      li.innerHTML = `<span>組合加成</span><strong>${result.combos.join('、')}</strong>`
      list.appendChild(li)
    }
    this.audio.result()
  }

  private animateScore(target: number) {
    const el = this.$('result-score')
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      el.textContent = Math.round(target * eased).toLocaleString('zh-Hant')
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  private updateCamera(dt: number) {
    if (this.phase === 'showcase') {
      this.showcaseT += dt
      const t = Math.min(1, this.showcaseT / this.showcaseDuration)
      this.camAngle += dt * 0.5
      // 遠距環繞，讓噴水池／建築／廣場進畫面
      this.camRadius = 22 - t * 1.6
      this.camHeight = 6.4 + Math.sin(t * Math.PI) * 1.1
      if (t >= 1) this.finishShowcase()
    } else if (this.phase === 'result') {
      this.camAngle += dt * 0.18
      this.camRadius = THREE.MathUtils.lerp(this.camRadius, 20.5, Math.min(1, dt * 1.2))
      this.camHeight = THREE.MathUtils.lerp(this.camHeight, 6.0, Math.min(1, dt * 1.2))
    }

    const x = Math.cos(this.camAngle) * this.camRadius
    const z = Math.sin(this.camAngle) * this.camRadius
    this.camera.position.set(x, this.camHeight, z)
    this.camera.lookAt(this.target)
  }

  private updateFx(dt: number) {
    if (this.snow) {
      const arr = this.snow.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1]! -= dt * 0.35
        if (arr[i + 1]! < 0) arr[i + 1] = 8 + Math.random() * 2
      }
      this.snow.geometry.attributes.position.needsUpdate = true
    }

    // 通電後小火車繞圈
    if (this.powered) {
      for (const mesh of this.ornamentMeshes.values()) {
        const train = mesh.getObjectByName('trainCars')
        if (train) train.rotation.y += dt * 0.55
      }
    }

    // 圍觀人群微微晃動
    if (this.crowd) {
      const t = performance.now() * 0.001
      this.crowd.children.forEach((child, i) => {
        const phase = (child.userData.bobPhase as number) ?? i
        child.position.y = Math.sin(t * 2.2 + phase) * 0.035
      })
    }

    if (!this.powered) return
    for (const pts of this.particleSystems) {
      const d = pts.userData.deviceFx as PlacedDevice
      const kind = pts.userData.fxKind as string
      const vel = pts.userData.vel as Float32Array
      const origin = pts.userData.origin as THREE.Vector3
      const mesh = this.deviceMeshes.get(d.id)
      const spout = mesh?.getObjectByName('fxSpout')
      if (spout) spout.getWorldPosition(origin)

      const arr = pts.geometry.attributes.position.array as Float32Array
      const count = arr.length / 3
      for (let i = 0; i < count; i++) {
        const o = i * 3
        // 積分
        arr[o]! += vel[o]! * dt
        arr[o + 1]! += vel[o + 1]! * dt
        arr[o + 2]! += vel[o + 2]! * dt

        if (kind === 'snow') {
          vel[o + 1]! -= 2.4 * dt // 重力下墜（略減，噴得更遠）
          vel[o]! *= 1 - 0.22 * dt
          vel[o + 2]! *= 1 - 0.22 * dt
        } else if (kind === 'bubble') {
          vel[o + 1]! += 0.15 * dt
          vel[o]! += Math.sin(performance.now() * 0.002 + i) * 0.15 * dt
        } else if (kind === 'fountain') {
          vel[o + 1]! -= 4.5 * dt
        } else if (kind === 'fire') {
          vel[o + 1]! -= 0.6 * dt
          vel[o]! *= 1 - 0.5 * dt
          vel[o + 2]! *= 1 - 0.5 * dt
        }

        const lifeOut =
          arr[o + 1]! < 0.05 ||
          arr[o + 1]! > 7.5 ||
          Math.hypot(arr[o]! - origin.x, arr[o + 2]! - origin.z) > (kind === 'snow' ? 14 : 5)
        if (lifeOut) this.resetDeviceParticle(kind, d.yaw, origin, arr, vel, i)
      }
      pts.geometry.attributes.position.needsUpdate = true
    }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000)
    this.lastFrameTime = now
    this.updateCamera(dt)
    this.updateFx(dt)
    this.composer.render()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.renderer.dispose()
  }
}
