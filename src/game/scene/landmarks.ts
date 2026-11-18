import * as THREE from 'three'
import { Theme } from '../theme'

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

/** 公園噴水池（大型） */
export function createFountain(): THREE.Group {
  const g = new THREE.Group()
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.6, 0.55, 32),
    mat(Theme.path, { roughness: 0.75, metalness: 0.15 }),
  )
  basin.position.y = 0.28
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.35, 0.14, 8, 36),
    mat(Theme.cream, { roughness: 0.7 }),
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.55
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(2.95, 32),
    mat(Theme.softIce, { roughness: 0.2, metalness: 0.35, transparent: true, opacity: 0.75 }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = 0.52
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.5, 2.0, 14),
    mat(Theme.cream, { roughness: 0.7 }),
  )
  pillar.position.y = 1.4
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mat(Theme.cream, { roughness: 0.65 }),
  )
  bowl.position.y = 2.35
  const midWater = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 16),
    mat(Theme.softIce, { roughness: 0.15, transparent: true, opacity: 0.8 }),
  )
  midWater.rotation.x = -Math.PI / 2
  midWater.position.y = 2.4
  const jet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.14, 1.8, 8),
    mat(Theme.softIce, {
      emissive: Theme.softIce,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.7,
    }),
  )
  jet.position.y = 3.4
  const spray = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 8),
    mat(Theme.softIce, { emissive: Theme.softIce, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 }),
  )
  spray.position.y = 4.2
  g.add(basin, rim, water, pillar, bowl, midWater, jet, spray)
  return g
}

/** 車站建築＋月台（大型） */
export function createStationBuilding(): THREE.Group {
  const g = new THREE.Group()
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(16, 5.5, 5.5),
    mat(Theme.cream, { roughness: 0.72 }),
  )
  hall.position.set(0, 2.85, 0)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(17.5, 0.5, 6.5),
    mat(Theme.lampPole, { roughness: 0.55, metalness: 0.25 }),
  )
  roof.position.set(0, 5.85, 0)
  const roofCap = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.8, 0.5),
    mat(Theme.crimson, { roughness: 0.65 }),
  )
  roofCap.position.set(0, 6.35, 0)
  // 拱窗
  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.4, 0.1),
      mat(Theme.softIce, {
        emissive: Theme.lampGlow,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      }),
    )
    win.position.set(i * 2.0, 2.9, 2.8)
    g.add(win)
  }
  // 月台
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.45, 4.2),
    mat(Theme.path, { roughness: 0.88 }),
  )
  platform.position.set(0, 0.22, 4.2)
  // 雨棚柱
  for (const x of [-7, -3.5, 0, 3.5, 7]) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 3.8, 8),
      mat(Theme.lampPole, { metalness: 0.4 }),
    )
    col.position.set(x, 2.0, 4.6)
    g.add(col)
  }
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(17.5, 0.16, 4.5),
    mat(Theme.lampPole, { metalness: 0.35, roughness: 0.5 }),
  )
  canopy.position.set(0, 4.0, 4.5)
  // 站名牌
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.9, 0.18),
    mat(Theme.crimson, { roughness: 0.6 }),
  )
  sign.position.set(0, 4.8, 2.95)
  // 側翼小亭
  for (const sx of [-10.5, 10.5]) {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3.2, 4),
      mat(Theme.cream, { roughness: 0.75 }),
    )
    wing.position.set(sx, 1.7, 0.5)
    g.add(wing)
  }
  g.add(hall, roof, roofCap, platform, canopy, sign)
  return g
}

/** 美術館／白盒展館（大型） */
export function createMuseumBuilding(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(14, 6.2, 7.5),
    mat(Theme.cream, { roughness: 0.82 }),
  )
  body.position.y = 3.2
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(15.5, 0.55, 8.8),
    mat(Theme.path, { roughness: 0.9 }),
  )
  plinth.position.y = 0.28
  // 大落地窗
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4.2, 0.12),
    mat(Theme.softIce, {
      emissive: Theme.lampGlow,
      emissiveIntensity: 0.28,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7,
    }),
  )
  glass.position.set(0, 3.4, 3.85)
  // 門廊柱
  for (const x of [-4.2, -1.4, 1.4, 4.2]) {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 4.8, 0.55),
      mat(Theme.cream, { roughness: 0.75 }),
    )
    col.position.set(x, 2.6, 4.5)
    g.add(col)
  }
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.4, 0.9),
    mat(Theme.cream, { roughness: 0.7 }),
  )
  lintel.position.set(0, 5.2, 4.5)
  // 頂部光帶
  const skylight = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.2, 4),
    mat(Theme.softIce, { emissive: Theme.lampGlow, emissiveIntensity: 0.35, roughness: 0.3 }),
  )
  skylight.position.set(0, 6.4, 0)
  // 入口階梯
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(8 - i * 0.4, 0.18, 1.2),
      mat(Theme.path, { roughness: 0.88 }),
    )
    step.position.set(0, 0.12 + i * 0.18, 5.6 + i * 0.35)
    g.add(step)
  }
  g.add(body, plinth, glass, lintel, skylight)
  return g
}

/** 圖書館／紅磚館（大型） */
export function createLibraryBuilding(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(13, 5.8, 6.5),
    mat(Theme.benchDark, { roughness: 0.85 }),
  )
  body.position.y = 3.0
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(14.2, 0.55, 7.4),
    mat(Theme.lampPole, { roughness: 0.7 }),
  )
  roof.position.y = 6.15
  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.0, 0.1),
      mat(Theme.lampGlow, { emissive: Theme.gold, emissiveIntensity: 0.5, roughness: 0.35 }),
    )
    win.position.set(i * 1.6, 3.2, 3.3)
    g.add(win)
  }
  // 側翼
  for (const sx of [-8.5, 8.5]) {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 4.2, 5),
      mat(Theme.benchDark, { roughness: 0.85 }),
    )
    wing.position.set(sx, 2.2, 0)
    g.add(wing)
  }
  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.45, 2.4),
    mat(Theme.path, { roughness: 0.88 }),
  )
  steps.position.set(0, 0.22, 4.4)
  g.add(body, roof, steps)
  return g
}

/** 天文觀測穹頂（大型） */
export function createObservatory(): THREE.Group {
  const g = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.0, 4.6, 3.2, 24),
    mat(Theme.path, { roughness: 0.8 }),
  )
  base.position.y = 1.6
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(3.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat(Theme.cream, { roughness: 0.55, metalness: 0.25 }),
  )
  dome.position.y = 3.5
  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 3.2, 4.0),
    mat(Theme.lampPole, { roughness: 0.5 }),
  )
  slit.position.set(0, 4.6, 0.3)
  const scope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.4, 4.2, 12),
    mat(Theme.lampPole, { metalness: 0.55, roughness: 0.4 }),
  )
  scope.rotation.z = 0.55
  scope.position.set(0.7, 4.4, 0)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.12, 8, 32),
    mat(Theme.lampPole, { metalness: 0.4 }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 3.2
  g.add(base, dome, slit, scope, ring)
  return g
}

/** 皇宮門廊／拱門（大型） */
export function createPalaceFacade(): THREE.Group {
  const g = new THREE.Group()
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 7.5, 2.4),
    mat(Theme.crimson, { roughness: 0.75 }),
  )
  wall.position.y = 3.85
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(21, 0.55, 2.8),
    mat(Theme.gold, { metalness: 0.55, roughness: 0.35 }),
  )
  trim.position.y = 7.8
  // 頂部小塔
  for (const x of [-8, -4, 0, 4, 8]) {
    const turret = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.4, 8),
      mat(Theme.gold, { metalness: 0.45, roughness: 0.35 }),
    )
    turret.position.set(x, 8.7, 0)
    g.add(turret)
  }
  for (const x of [-6.5, 0, 6.5]) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.2, 8, 18, Math.PI),
      mat(Theme.gold, { metalness: 0.5, roughness: 0.35 }),
    )
    arch.rotation.x = Math.PI
    arch.position.set(x, 3.6, 1.35)
    g.add(arch)
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.45, 3.8, 12),
      mat(Theme.cream, { roughness: 0.7 }),
    )
    pillar.position.set(x - 1.7, 2.0, 1.2)
    const pillar2 = pillar.clone()
    pillar2.position.x = x + 1.7
    g.add(pillar, pillar2)
  }
  // 前廣場台階
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(18 - i * 0.6, 0.2, 1.4),
      mat(Theme.path, { roughness: 0.88 }),
    )
    step.position.set(0, 0.12 + i * 0.2, 2.8 + i * 0.4)
    g.add(step)
  }
  g.add(wall, trim)
  return g
}

/** 美術館風格方格地板（大範圍） */
export function createMuseumFloor(radius = 28): THREE.Group {
  const g = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    mat(Theme.ground, { roughness: 0.92 }),
  )
  base.rotation.x = -Math.PI / 2
  base.receiveShadow = true
  base.name = 'ground'
  base.userData.ground = true
  g.add(base)
  const tile = 1.6
  const n = Math.floor((radius * 1.35) / tile)
  for (let ix = -n; ix <= n; ix++) {
    for (let iz = -n; iz <= n; iz++) {
      if (ix * ix + iz * iz > n * n * 0.9) continue
      const light = (ix + iz) % 2 === 0
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(tile * 0.94, 0.04, tile * 0.94),
        mat(light ? Theme.cream : Theme.path, { roughness: 0.88 }),
      )
      t.position.set(ix * tile, 0.025, iz * tile)
      g.add(t)
    }
  }
  return g
}

/** Q 版圍觀路人 */
export function createSpectator(seed = 0): THREE.Group {
  const g = new THREE.Group()
  const hues = [Theme.crimson, Theme.gold, Theme.softPink, Theme.softLilac, Theme.softTeal, Theme.cream, '#457b9d']
  const coat = hues[seed % hues.length]!
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.35, 6, 10),
    mat(coat, { roughness: 0.75 }),
  )
  body.position.y = 0.55
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), mat('#ffe0c2', { roughness: 0.65 }))
  head.position.y = 0.95
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8),
    mat(seed % 2 ? Theme.crimson : Theme.lampPole, { roughness: 0.7 }),
  )
  hat.scale.set(1, 0.7, 1)
  hat.position.y = 1.08
  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.035, 8, 14),
    mat(seed % 3 ? Theme.gold : Theme.softPink, { roughness: 0.7 }),
  )
  scarf.rotation.x = Math.PI / 2
  scarf.position.y = 0.82
  g.add(body, head, hat, scarf)
  g.userData.spectator = true
  g.userData.bobPhase = seed * 0.7
  return g
}

export type LandmarkKind = 'park' | 'station' | 'museum' | 'library' | 'observatory' | 'palace' | 'candy' | 'neon'

export function landmarkKindForScene(sceneId: string): LandmarkKind {
  switch (sceneId) {
    case 'station_snow':
      return 'station'
    case 'museum_white':
      return 'museum'
    case 'library_night':
      return 'library'
    case 'star_observatory':
      return 'observatory'
    case 'palace_feast':
      return 'palace'
    case 'candy_town':
      return 'candy'
    case 'party_neon':
      return 'neon'
    case 'ice_blue':
    case 'church_bells':
    case 'cozy_fairy':
    default:
      return 'park'
  }
}
