import * as THREE from 'three'
import type { DecorDef } from '../types'
import { Theme } from '../theme'
import { createDetailedDecorMesh, createStringBulbAt } from './decorMeshes'
import {
  createFountain,
  createLibraryBuilding,
  createMuseumBuilding,
  createMuseumFloor,
  createObservatory,
  createPalaceFacade,
  createSpectator,
  createStationBuilding,
  landmarkKindForScene,
} from './landmarks'
import { TREE_LAYER_DEFS } from './treeLayers'
import { surfacePath } from './treeSurface'

const matCache = new Map<string, THREE.MeshStandardMaterial>()

function mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.roughness ?? 0.55}|${opts.metalness ?? 0.15}|${opts.transparent ?? false}`
  let m = matCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.55,
      metalness: opts.metalness ?? 0.15,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1,
    })
    matCache.set(key, m)
  }
  return m.clone()
}

function roundedBall(radius: number, color: string, emissive?: string, emissiveIntensity = 0.35) {
  const g = new THREE.SphereGeometry(radius, 18, 14)
  return new THREE.Mesh(
    g,
    mat(color, {
      emissive,
      emissiveIntensity: emissive ? emissiveIntensity : 0,
      roughness: 0.35,
    }),
  )
}

/** 沿枝條取點：先下垂，末端微微上翹（真實冷杉姿態） */
function branchPoint(length: number, droop: number, t: number): THREE.Vector3 {
  const x = length * t
  // 抛物線下垂 + 末端回翹
  const y = -droop * (4 * t * (1 - t)) + droop * 0.22 * Math.pow(t, 2.2)
  return new THREE.Vector3(x, y, 0)
}

/** 單根主枝：木質枝幹 + 密針葉簇 + 側小枝 */
function createRealisticBranch(
  length: number,
  droop: number,
  color: string,
  woodColor: string,
  seed: number,
): THREE.Group {
  const branch = new THREE.Group()
  const dark = mat(color, { roughness: 0.86 })
  const mid = mat(color, { roughness: 0.8 })
  const wood = mat(woodColor, { roughness: 0.9 })

  // 木質主幹（兩段近似曲線）
  const segs = 3
  for (let s = 0; s < segs; s++) {
    const t0 = s / segs
    const t1 = (s + 1) / segs
    const p0 = branchPoint(length, droop, t0)
    const p1 = branchPoint(length, droop, t1)
    const midP = p0.clone().lerp(p1, 0.5)
    const segLen = p0.distanceTo(p1)
    const r0 = 0.035 * (1 - t0 * 0.7)
    const r1 = 0.028 * (1 - t1 * 0.7)
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, segLen, 6), wood)
    stick.position.copy(midP)
    stick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize())
    branch.add(stick)
  }

  // 針葉簇沿枝條
  const tufts = 5 + (seed % 2)
  for (let i = 1; i <= tufts; i++) {
    const t = i / tufts
    const p = branchPoint(length, droop, t)
    const size = 0.14 + t * 0.16
    const needle = new THREE.Mesh(new THREE.SphereGeometry(size, 9, 7), i % 2 ? mid : dark)
    // 扁長針葉團
    needle.scale.set(1.35 + t * 0.4, 0.55, 0.85)
    needle.position.copy(p)
    needle.position.y += 0.02
    needle.userData.treeSurface = true
    branch.add(needle)

    // 末端上翹尖
    if (i === tufts) {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(size * 0.55, size * 1.4, 8), mid)
      tip.position.set(p.x + size * 0.55, p.y + size * 0.25, 0)
      tip.rotation.z = -Math.PI / 2.4
      tip.userData.treeSurface = true
      branch.add(tip)
    }
  }

  // 左右側小枝（中段）
  for (const side of [-1, 1] as const) {
    const t = 0.45 + (seed % 3) * 0.08
    const p = branchPoint(length, droop, t)
    const sideLen = length * (0.28 + (seed % 2) * 0.06)
    const twig = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.022, sideLen, 5),
      wood,
    )
    twig.position.set(p.x, p.y - 0.02, side * sideLen * 0.35)
    twig.rotation.z = side * 0.85
    twig.rotation.x = side * 0.15
    branch.add(twig)

    const sideNeedle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), dark)
    sideNeedle.scale.set(1.2, 0.5, 0.75)
    sideNeedle.position.set(p.x + sideLen * 0.15, p.y - 0.06, side * sideLen * 0.65)
    sideNeedle.userData.treeSurface = true
    branch.add(sideNeedle)
  }

  return branch
}

/** 一層輪生：層間留空，枝長微亂，外輪廓不規則 */
function createWhorlLayer(
  y: number,
  radius: number,
  branchCount: number,
  droop: number,
  color: string,
  woodColor: string,
): THREE.Group {
  const layer = new THREE.Group()
  layer.position.y = y

  for (let i = 0; i < branchCount; i++) {
    const a = (i / branchCount) * Math.PI * 2 + y * 0.23
    // 長短交錯，避免圓盤感
    const lenScale = 0.78 + ((i * 37) % 5) * 0.055
    const len = radius * lenScale
    const localDroop = droop * (0.85 + ((i * 17) % 4) * 0.08)
    const branch = createRealisticBranch(len, localDroop, color, woodColor, i + Math.floor(y * 10))
    branch.rotation.y = a
    // 主枝略向下傾出樹幹
    branch.rotation.z = -0.12 - droop * 0.15
    layer.add(branch)
  }

  // 層內填補：稍短的內圈枝，讓輪生更密但不封死層縫
  const innerCount = Math.max(4, Math.floor(branchCount * 0.55))
  for (let i = 0; i < innerCount; i++) {
    const a = (i / innerCount) * Math.PI * 2 + 0.4 + y * 0.1
    const branch = createRealisticBranch(radius * 0.55, droop * 0.7, color, woodColor, i + 20)
    branch.rotation.y = a
    branch.rotation.z = -0.2
    branch.position.y = -0.08
    layer.add(branch)
  }

  return layer
}

export function createTree(): THREE.Group {
  const tree = new THREE.Group()
  tree.name = 'christmasTree'

  // 樹幹：層間會露出，像真樹
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.28, 6.3, 14),
    mat(Theme.trunk, { roughness: 0.94 }),
  )
  trunk.position.y = 3.15
  tree.add(trunk)

  // 根際略粗
  const rootFlare = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.38, 0.35, 12),
    mat(Theme.stump, { roughness: 0.95 }),
  )
  rootFlare.position.y = 0.18
  tree.add(rootFlare)

  for (const L of TREE_LAYER_DEFS) {
    const color = Theme.treeLayers[L.color] ?? Theme.treeLayers[0]!
    tree.add(createWhorlLayer(L.y, L.r, L.branches, L.droop, color, Theme.trunk))
  }

  // 頂芽／領導幹
  const leader = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.06, 0.55, 8),
    mat(Theme.trunk, { roughness: 0.9 }),
  )
  leader.position.y = 6.25
  tree.add(leader)
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.55, 10),
    mat(Theme.treeLayers[4], { roughness: 0.8 }),
  )
  tip.position.y = 6.55
  tip.userData.treeSurface = true
  tree.add(tip)
  // 頂部小輪生
  const topWhorl = createWhorlLayer(6.15, 0.28, 5, 0.08, Theme.treeLayers[4], Theme.trunk)
  tree.add(topWhorl)

  const hit = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 6.5, 28),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  hit.position.y = 3.4
  hit.name = 'treeHit'
  hit.userData.treeSurface = true
  tree.add(hit)

  const topAnchor = new THREE.Object3D()
  topAnchor.position.set(0, 6.85, 0)
  topAnchor.name = 'topAnchor'
  tree.add(topAnchor)

  return tree
}

export function createParkEnvironment(sceneId = 'cozy_fairy'): THREE.Group {
  const root = new THREE.Group()
  root.name = 'park'
  const kind = landmarkKindForScene(sceneId)
  const groundR = 32

  // 美術館／圖書館：方格地板；其餘：大圓雪地
  if (kind === 'museum' || kind === 'library') {
    root.add(createMuseumFloor(groundR))
  } else {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(groundR, 64),
      mat(Theme.ground, { roughness: 0.96 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.name = 'ground'
    ground.userData.ground = true
    root.add(ground)
  }

  // 樹周圍石板＋外圈廣場環
  const path = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 4.2, 64),
    mat(Theme.path, { roughness: 0.9 }),
  )
  path.rotation.x = -Math.PI / 2
  path.position.y = 0.012
  root.add(path)
  const plaza = new THREE.Mesh(
    new THREE.RingGeometry(9.5, 12.5, 72),
    mat(Theme.path, { roughness: 0.92 }),
  )
  plaza.rotation.x = -Math.PI / 2
  plaza.position.y = 0.01
  root.add(plaza)
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    const rr = 2.7 + (i % 5) * 0.28
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.04, 0.28),
      mat(i % 2 ? Theme.path : Theme.bench, { roughness: 0.92 }),
    )
    tile.position.set(Math.cos(a) * rr, 0.03, Math.sin(a) * rr)
    tile.rotation.y = -a
    root.add(tile)
  }

  // 長椅＋路燈（雙圈拉開）
  const benchR = kind === 'station' ? 8.5 : 7.8
  const lampR = 12.5
  const lampR2 = 18.5
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const bench = createParkBench()
    bench.position.set(Math.cos(a) * benchR, 0, Math.sin(a) * benchR)
    bench.rotation.y = -a + Math.PI / 2
    bench.scale.setScalar(1.15)
    root.add(bench)
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.15
    const lamp = createVictorianLamp()
    lamp.position.set(Math.cos(a) * lampR, 0, Math.sin(a) * lampR)
    lamp.scale.setScalar(1.25)
    root.add(lamp)
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4
    const lamp = createVictorianLamp()
    lamp.position.set(Math.cos(a) * lampR2, 0, Math.sin(a) * lampR2)
    lamp.scale.setScalar(1.4)
    root.add(lamp)
  }

  // 關卡地標（後方／側翼大景）
  if (kind === 'park' || kind === 'candy' || kind === 'neon') {
    const fountain = createFountain()
    fountain.position.set(0, 0, -16)
    root.add(fountain)
    const gazebo = createGazebo()
    gazebo.position.set(-16, 0, -10)
    gazebo.scale.setScalar(2.2)
    root.add(gazebo)
    const gazebo2 = createGazebo()
    gazebo2.position.set(16.5, 0, -9)
    gazebo2.scale.setScalar(2.0)
    gazebo2.rotation.y = 0.5
    root.add(gazebo2)
    const gazebo3 = createGazebo()
    gazebo3.position.set(-14, 0, 12)
    gazebo3.scale.setScalar(1.7)
    gazebo3.rotation.y = -0.8
    root.add(gazebo3)
  }
  if (kind === 'park' || kind === 'candy') {
    const f2 = createFountain()
    f2.position.set(15, 0, 4)
    f2.scale.setScalar(0.7)
    root.add(f2)
    const f3 = createFountain()
    f3.position.set(-15, 0, 2)
    f3.scale.setScalar(0.55)
    root.add(f3)
  }
  if (kind === 'station') {
    const station = createStationBuilding()
    station.position.set(0, 0, -18)
    root.add(station)
    // 雙軌
    for (const z of [-12.5, -11.6]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(26, 0.1, 0.28),
        mat(Theme.lampPole, { metalness: 0.6, roughness: 0.4 }),
      )
      rail.position.set(0, 0.06, z)
      root.add(rail)
    }
    const sleeperMat = mat(Theme.benchDark, { roughness: 0.9 })
    for (let i = -10; i <= 10; i++) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.4), sleeperMat)
      sleeper.position.set(i * 1.2, 0.04, -12.05)
      root.add(sleeper)
    }
  }
  if (kind === 'museum') {
    const museum = createMuseumBuilding()
    museum.position.set(0, 0, -18)
    root.add(museum)
    // 側翼雕塑台
    for (const sx of [-14, 14]) {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 1.6, 12),
        mat(Theme.cream, { roughness: 0.8 }),
      )
      pedestal.position.set(sx, 0.8, -8)
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 16, 12),
        mat(Theme.softIce, { metalness: 0.35, roughness: 0.35, emissive: Theme.lampGlow, emissiveIntensity: 0.2 }),
      )
      orb.position.set(sx, 2.2, -8)
      root.add(pedestal, orb)
    }
  }
  if (kind === 'library') {
    const lib = createLibraryBuilding()
    lib.position.set(0, 0, -18)
    root.add(lib)
  }
  if (kind === 'observatory') {
    const obs = createObservatory()
    obs.position.set(-14, 0, -14)
    root.add(obs)
    const obs2 = createObservatory()
    obs2.position.set(15, 0, -11)
    obs2.scale.setScalar(0.72)
    root.add(obs2)
  }
  if (kind === 'palace') {
    const palace = createPalaceFacade()
    palace.position.set(0, 0, -19)
    root.add(palace)
  }
  if (kind === 'neon') {
    for (let i = -3; i <= 3; i++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.0, 0.14, 8, 24, Math.PI),
        mat(Theme.softPink, { emissive: Theme.softLilac, emissiveIntensity: 0.75, roughness: 0.35 }),
      )
      arch.rotation.x = Math.PI
      arch.position.set(i * 3.6, 2.1, -15)
      root.add(arch)
    }
    const fountain = createFountain()
    fountain.position.set(0, 0, 16)
    fountain.scale.setScalar(0.85)
    root.add(fountain)
  }
  if (kind === 'candy') {
    for (const side of [-1, 1]) {
      const cane = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.4, 12, 28, Math.PI * 1.2),
        mat(side > 0 ? Theme.crimson : Theme.cream, { roughness: 0.55 }),
      )
      cane.position.set(side * 15, 2.4, -8)
      cane.rotation.z = side * 0.3
      root.add(cane)
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 5.5, 10),
        mat(side > 0 ? Theme.cream : Theme.crimson, { roughness: 0.55 }),
      )
      stick.position.set(side * 15, 2.6, -8)
      root.add(stick)
    }
  }

  // 外圈雪丘／地景點綴
  for (let i = 0; i < 28; i++) {
    const mound = new THREE.Mesh(
      new THREE.SphereGeometry(1.1 + Math.random() * 1.2, 12, 10),
      mat(Theme.snow, { roughness: 0.96 }),
    )
    const a = Math.random() * Math.PI * 2
    const r = 8 + Math.random() * 20
    mound.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r)
    mound.scale.y = 0.28
    root.add(mound)
  }

  return root
}

/** 依人氣生成圍觀人群 */
export function createCrowd(popularity: number): THREE.Group {
  const root = new THREE.Group()
  root.name = 'crowd'
  let count = 3
  if (popularity >= 10000) count = 8
  if (popularity >= 25000) count = 14
  if (popularity >= 45000) count = 22
  if (popularity >= 65000) count = 32
  if (popularity >= 85000) count = 42

  for (let i = 0; i < count; i++) {
    const person = createSpectator(i)
    const ring = 4.8 + (i % 5) * 0.55 + Math.random() * 0.35
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.12
    person.position.set(Math.cos(a) * ring, 0, Math.sin(a) * ring)
    person.lookAt(0, 0.8, 0)
    person.scale.setScalar(0.85 + (i % 3) * 0.08)
    root.add(person)
  }
  return root
}

function createParkBench(): THREE.Group {
  const g = new THREE.Group()
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 0.48), mat(Theme.bench, { roughness: 0.78 }))
  seat.position.y = 0.42
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.5, 0.08), mat(Theme.benchDark, { roughness: 0.78 }))
  back.position.set(0, 0.72, -0.2)
  // 鐵花靠背橫條
  for (const yy of [0.55, 0.68, 0.82]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.03, 0.03), mat(Theme.lampPole, { metalness: 0.4, roughness: 0.45 }))
    bar.position.set(0, yy, -0.16)
    g.add(bar)
  }
  for (const x of [-0.58, 0.58]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.42), mat(Theme.lampPole, { metalness: 0.35, roughness: 0.5 }))
    leg.position.set(x, 0.21, 0)
    g.add(leg)
  }
  // 椅上薄雪
  const snow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.42), mat(Theme.snow, { roughness: 0.95 }))
  snow.position.y = 0.48
  g.add(seat, back, snow)
  return g
}

function createVictorianLamp(): THREE.Group {
  const g = new THREE.Group()
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 2.55, 12),
    mat(Theme.lampPole, { metalness: 0.55, roughness: 0.4 }),
  )
  pole.position.y = 1.28
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.18, 12),
    mat(Theme.lampPole, { metalness: 0.5, roughness: 0.45 }),
  )
  base.position.y = 0.09
  // 燈籠籠體
  const cage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.38, 8),
    mat('#3a3a45', { metalness: 0.45, roughness: 0.4, transparent: true, opacity: 0.85 }),
  )
  cage.position.y = 2.55
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 14, 12),
    mat(Theme.lampGlow, {
      emissive: Theme.gold,
      emissiveIntensity: 1.15,
      roughness: 0.35,
    }),
  )
  glass.position.y = 2.55
  glass.name = 'streetLampHead'
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.2, 8),
    mat(Theme.lampPole, { metalness: 0.5, roughness: 0.4 }),
  )
  roof.position.y = 2.82
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat(Theme.goldDeep, { metalness: 0.7, roughness: 0.3 }))
  tip.position.y = 2.95
  // 暖光光暈球（視覺 bloom）
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    mat(Theme.lampGlow, {
      emissive: Theme.gold,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.35,
      roughness: 1,
    }),
  )
  halo.position.y = 2.55
  halo.name = 'streetLampHead'
  g.add(base, pole, cage, glass, roof, tip, halo)
  return g
}

function createGazebo(): THREE.Group {
  const g = new THREE.Group()
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.5, 0.12, 8),
    mat(Theme.bench, { roughness: 0.85 }),
  )
  floor.position.y = 0.06
  g.add(floor)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 1.8, 10),
      mat(Theme.cream, { roughness: 0.75 }),
    )
    col.position.set(Math.cos(a) * 1.15, 0.96, Math.sin(a) * 1.15)
    g.add(col)
  }
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.7, 1.1, 8),
    mat(Theme.crimson, { roughness: 0.7 }),
  )
  roof.position.y = 2.35
  const snowRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.55, 0.35, 8),
    mat(Theme.snow, { roughness: 0.95 }),
  )
  snowRoof.position.y = 2.55
  // 涼亭內暖燈
  const light = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    mat(Theme.lampGlow, { emissive: Theme.gold, emissiveIntensity: 1.0, roughness: 0.4 }),
  )
  light.position.y = 1.7
  light.name = 'streetLampHead'
  g.add(roof, snowRoof, light)
  return g
}

export function createDecorPreviewMesh(def: DecorDef, powered = false): THREE.Object3D {
  const mesh = createDetailedDecorMesh(def, powered)
  if (powered) setPoweredEmissive(mesh, true)
  return mesh
}

export function createLightStringMesh(
  points: THREE.Vector3[],
  def: DecorDef,
  powered: boolean,
): THREE.Group {
  const g = new THREE.Group()
  const path = surfacePath(points, 12)
  const glowStrength = powered ? 0.95 : 0

  if (path.length < 2) {
    if (path[0]) {
      const bulb = roundedBall(0.08, def.swatch, powered ? def.swatch : undefined, glowStrength || 0.15)
      bulb.position.copy(path[0])
      g.add(bulb)
    }
    return g
  }

  const curve = new THREE.CatmullRomCurve3(path)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(24, path.length * 2), 0.016, 6, false),
    mat(powered ? Theme.wireLit : Theme.wire, {
      roughness: 0.75,
      emissive: powered ? def.swatch : undefined,
      emissiveIntensity: powered ? 0.18 : 0,
    }),
  )
  g.add(tube)

  const count = Math.max(10, path.length)
  for (let i = 0; i <= count; i++) {
    const t = i / count
    const p = curve.getPoint(t)
    const color =
      def.colorFamily === 'mixed'
        ? Theme.mixed[i % Theme.mixed.length]!
        : def.swatch
    const bulb = createStringBulbAt(def, color, powered)
    bulb.position.copy(p)
    // 讓燈泡略朝外，避免埋進樹面
    bulb.lookAt(p.x * 2, p.y, p.z * 2)
    if (powered) {
      const spriteMat = new THREE.SpriteMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(0.1, 0.1, 0.1)
      sprite.position.copy(p)
      g.add(sprite)
    }
    g.add(bulb)
  }
  return g
}

export function setPoweredEmissive(root: THREE.Object3D, on: boolean) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const material = mesh.material as THREE.MeshStandardMaterial
    if (!material || !('emissiveIntensity' in material)) return
    if (material.userData.baseEmissiveIntensity == null) {
      material.userData.baseEmissiveIntensity = material.emissiveIntensity
      material.userData.baseEmissive = material.emissive.clone()
    }
    if (on) {
      // 只加強「本來就會發光」的材質，不幫整機亂加自發光
      if (material.userData.baseEmissiveIntensity > 0.01) {
        material.emissiveIntensity = Math.min(
          Math.max(material.userData.baseEmissiveIntensity * 1.1, material.userData.baseEmissiveIntensity),
          1.05,
        )
      }
    } else {
      material.emissive.copy(material.userData.baseEmissive)
      material.emissiveIntensity = material.userData.baseEmissiveIntensity
    }
  })
}
