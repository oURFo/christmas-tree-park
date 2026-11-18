import * as THREE from 'three'
import type { DecorDef } from '../types'
import { Theme } from '../theme'

const matCache = new Map<string, THREE.MeshStandardMaterial>()

function M(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.roughness ?? ''}|${opts.metalness ?? ''}|${opts.transparent ?? ''}|${opts.opacity ?? ''}|${opts.emissiveIntensity ?? ''}`
  let m = matCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.45,
      metalness: opts.metalness ?? 0.2,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1,
    })
    matCache.set(key, m)
  }
  return m.clone()
}

function ball(r: number, color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}, seg = 28) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(16, (seg * 0.75) | 0)), M(color, opts))
}

function glowOpts(glow?: string, intensity = 0.55): Partial<THREE.MeshStandardMaterialParameters> {
  return glow ? { emissive: glow, emissiveIntensity: intensity } : {}
}

/** 五角星擠出 */
function makeStarShape(outer = 0.35, inner = 0.15): THREE.Shape {
  const shape = new THREE.Shape()
  // 從 +Y 開始：尖頂朝上
  for (let i = 0; i < 10; i++) {
    const ang = Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 === 0 ? outer : inner
    const x = Math.cos(ang) * rad
    const y = Math.sin(ang) * rad
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

function extrudeStar(outer: number, inner: number, depth: number, color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const geo = new THREE.ExtrudeGeometry(makeStarShape(outer, inner), {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.25,
    bevelSize: outer * 0.06,
    bevelSegments: 2,
  })
  geo.center()
  return new THREE.Mesh(geo, M(color, { metalness: 0.65, roughness: 0.28, ...opts }))
}

function hangCap(y = 0.18) {
  const g = new THREE.Group()
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.05, 12), M('#e8a84a', { metalness: 0.85, roughness: 0.3 }))
  cap.position.y = y
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), M('#c9a227', { metalness: 0.9, roughness: 0.25 }))
  ring.position.y = y + 0.04
  ring.rotation.x = Math.PI / 2
  g.add(cap, ring)
  return g
}

function candyCane(glow?: string) {
  const g = new THREE.Group()
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.24, 0),
    new THREE.Vector3(0, 0.0, 0),
    new THREE.Vector3(0.015, 0.12, 0),
    new THREE.Vector3(0.08, 0.2, 0),
    new THREE.Vector3(0.16, 0.18, 0),
    new THREE.Vector3(0.2, 0.1, 0),
    new THREE.Vector3(0.18, 0.04, 0),
  ])
  const white = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.04, 16, false),
    M('#fff8f0', { roughness: 0.32, ...glowOpts(glow, 0.2) }),
  )
  g.add(white)
  // 螺旋紅帶：沿切線扭轉放置
  for (let i = 0; i < 22; i++) {
    const t = (i + 0.5) / 22
    if (Math.floor(i / 2) % 2 === 0) continue
    const p = curve.getPoint(t)
    const tan = curve.getTangent(t)
    const band = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.01, 6, 10), M('#e85d4c', { roughness: 0.38 }))
    band.position.copy(p)
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.clone().normalize())
    g.add(band)
  }
  return g
}

function velvetBow(color: string, scale = 1, glow?: string) {
  const g = new THREE.Group()
  const loopMat = M(color, { roughness: 0.62, ...glowOpts(glow, 0.15) })
  const knotMat = M('#8b1e1e', { roughness: 0.58 })
  const goldMat = M('#ffd27a', { metalness: 0.7, roughness: 0.32 })

  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.13 * scale, 0.055 * scale, 16, 36, Math.PI * 1.4), loopMat)
    loop.rotation.y = side * 0.55
    loop.rotation.z = side * 0.35
    loop.position.set(side * 0.1 * scale, 0.02 * scale, 0)
    g.add(loop)
    // 金邊描線
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.13 * scale, 0.012 * scale, 8, 28, Math.PI * 1.35), goldMat)
    trim.rotation.y = side * 0.55
    trim.rotation.z = side * 0.35
    trim.position.set(side * 0.1 * scale, 0.02 * scale, 0.01 * scale)
    g.add(trim)
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scale, 20, 16), knotMat)
  knot.scale.set(1.2, 0.85, 0.95)
  const knotRing = new THREE.Mesh(new THREE.TorusGeometry(0.05 * scale, 0.012 * scale, 8, 20), goldMat)
  knotRing.rotation.x = Math.PI / 2
  g.add(knot, knotRing)

  for (const side of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.09 * scale, 0.28 * scale, 0.028 * scale), loopMat)
    tail.position.set(side * 0.06 * scale, -0.18 * scale, 0.01)
    tail.rotation.z = side * 0.38
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05 * scale, 0.09 * scale, 10), loopMat)
    tip.position.set(side * 0.1 * scale, -0.34 * scale, 0.01)
    tip.rotation.z = side * 0.38 + Math.PI
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.018 * scale, 0.28 * scale, 0.01 * scale), goldMat)
    edge.position.set(side * 0.1 * scale, -0.18 * scale, 0.025)
    edge.rotation.z = side * 0.38
    g.add(tail, tip, edge)
  }
  return g
}

function goldenBell(x: number, glow?: string) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.72),
    M('#f4c430', { metalness: 0.75, roughness: 0.28, ...glowOpts(glow ?? '#ffe08a', glow ? 0.45 : 0.05) }),
  )
  body.scale.set(1, 1.15, 1)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 10, 24), M('#e0a800', { metalness: 0.8, roughness: 0.3 }))
  rim.rotation.x = Math.PI / 2
  rim.position.y = -0.05
  const clapper = ball(0.022, '#8d6e63', { metalness: 0.4 })
  clapper.position.y = -0.08
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 14), M('#e8a84a', { metalness: 0.85 }))
  bail.position.y = 0.1
  g.add(body, rim, clapper, bail)
  g.position.x = x
  return g
}

function gingerbread() {
  const g = new THREE.Group()
  const dough = M('#c47a3b', { roughness: 0.85 })
  const icing = M('#fff8f0', { roughness: 0.55 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.08, 8, 16), dough)
  body.position.y = -0.02
  const head = ball(0.075, '#c47a3b', { roughness: 0.85 }, 20)
  head.position.y = 0.12
  // arms
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.08, 6, 12), dough)
    arm.rotation.z = s * 1.1
    arm.position.set(s * 0.1, 0.02, 0)
    g.add(arm)
  }
  // legs
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.07, 6, 12), dough)
    leg.position.set(s * 0.045, -0.14, 0)
    g.add(leg)
  }
  // face
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI), icing)
  smile.position.set(0, 0.1, 0.07)
  smile.rotation.x = Math.PI
  const eyeL = ball(0.012, '#3d2914', {}, 10)
  eyeL.position.set(-0.025, 0.135, 0.07)
  const eyeR = eyeL.clone()
  eyeR.position.x = 0.025
  const button1 = ball(0.015, '#e85d4c', {}, 10)
  button1.position.set(0, 0.02, 0.075)
  const button2 = button1.clone()
  button2.position.y = -0.03
  g.add(body, head, smile, eyeL, eyeR, button1, button2)
  return g
}

function christmasSock() {
  const g = new THREE.Group()
  const red = M('#e85d4c', { roughness: 0.72 })
  const white = M('#f8f9fa', { roughness: 0.68 })
  // 襪筒
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.22, 24), red)
  leg.position.y = 0.06
  // 腳掌曲線
  const footCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, -0.04, 0),
    new THREE.Vector3(0.04, -0.1, 0),
    new THREE.Vector3(0.12, -0.1, 0),
    new THREE.Vector3(0.16, -0.06, 0),
  ])
  const foot = new THREE.Mesh(new THREE.TubeGeometry(footCurve, 24, 0.07, 16, false), red)
  const toe = ball(0.075, '#e85d4c', { roughness: 0.72 }, 20)
  toe.scale.set(1.15, 0.75, 1)
  toe.position.set(0.16, -0.06, 0)
  // 白色翻邊
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.032, 12, 28), white)
  cuff.rotation.x = Math.PI / 2
  cuff.position.y = 0.18
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const fluff = ball(0.025, '#ffffff', { roughness: 0.9 }, 10)
    fluff.position.set(Math.cos(a) * 0.08, 0.18, Math.sin(a) * 0.08)
    g.add(fluff)
  }
  const heel = ball(0.055, '#f8f9fa', { roughness: 0.7 }, 16)
  heel.position.set(-0.05, -0.02, 0)
  // 掛環
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 16), M('#ffd27a', { metalness: 0.7 }))
  loop.position.y = 0.24
  g.add(leg, foot, toe, cuff, heel, loop)
  return g
}

function pineCone() {
  const g = new THREE.Group()
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 12), M('#6d4c41', { roughness: 0.92 }))
  g.add(core)
  for (let row = 0; row < 5; row++) {
    const y = -0.08 + row * 0.05
    const count = 6 + row
    const rad = 0.05 + row * 0.012
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + row * 0.25
      const scale = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 10, 8),
        M(row % 2 ? '#8d6e63' : '#a1887f', { roughness: 0.9 }),
      )
      scale.scale.set(1, 0.45, 1.2)
      scale.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad)
      scale.lookAt(0, y + 0.2, 0)
      g.add(scale)
    }
  }
  // snow tip
  const snow = ball(0.04, '#f5fbff', { roughness: 0.95 }, 12)
  snow.position.y = 0.12
  g.add(snow)
  return g
}

function holly() {
  const g = new THREE.Group()
  const leafMat = M('#3d7a5a', { roughness: 0.65 })
  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Group()
    // 尖角葉：菱形擠壓
    const blade = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), leafMat)
    blade.scale.set(1.6, 0.18, 0.75)
    leaf.add(blade)
    for (const t of [-0.7, -0.35, 0.35, 0.7]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 8), leafMat)
      spike.position.set(t * 0.12, 0, 0.05)
      spike.rotation.z = t > 0 ? -0.8 : 0.8
      leaf.add(spike)
    }
    leaf.rotation.z = ((i - 1) * Math.PI) / 2.8
    leaf.rotation.y = i * 0.35
    leaf.position.set(Math.cos(i * 2) * 0.03, 0, Math.sin(i * 2) * 0.02)
    g.add(leaf)
  }
  for (const [x, y, z] of [
    [0.02, 0.04, 0.06],
    [-0.03, 0.02, 0.05],
    [0.01, -0.02, 0.07],
    [-0.01, 0.05, 0.04],
  ] as const) {
    const berry = ball(0.03, '#e85d4c', { roughness: 0.35, metalness: 0.2 }, 16)
    berry.position.set(x, y, z)
    g.add(berry)
  }
  return g
}

function miniDrum() {
  const g = new THREE.Group()
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.11, 36), M('#d96b6b', { roughness: 0.5 }))
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.014, 36), M('#f8f1e3', { roughness: 0.45 }))
  top.position.y = 0.06
  const bottom = top.clone()
  bottom.position.y = -0.06
  const topRim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.01, 10, 36), M('#ffd27a', { metalness: 0.75, roughness: 0.3 }))
  topRim.rotation.x = Math.PI / 2
  topRim.position.y = 0.06
  const botRim = topRim.clone()
  botRim.position.y = -0.06
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 10), M('#ffd27a', { metalness: 0.7, roughness: 0.32 }))
    rope.position.set(Math.cos(a) * 0.112, 0, Math.sin(a) * 0.112)
    // Z 字交叉繩感
    rope.rotation.x = (i % 2 === 0 ? 1 : -1) * 0.25
    g.add(rope)
  }
  // 鼓棒
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.18, 10), M('#d4a373', { roughness: 0.6 }))
  stick.rotation.z = 0.9
  stick.position.set(0.12, 0.08, 0.05)
  const tip = ball(0.015, '#f8f1e3', { roughness: 0.5 }, 10)
  tip.position.set(0.18, 0.14, 0.05)
  g.add(shell, top, bottom, topRim, botRim, stick, tip)
  return g
}

function snowman() {
  const g = new THREE.Group()
  const snow = { roughness: 0.92 }
  const body = ball(0.115, '#f8f9fa', snow, 32)
  const belly = ball(0.09, '#f8f9fa', snow, 28)
  belly.position.y = 0.15
  const head = ball(0.07, '#f8f9fa', snow, 26)
  head.position.y = 0.28
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 12, 24), M('#ff9bb0', { roughness: 0.72 }))
  scarf.rotation.x = Math.PI / 2
  scarf.position.y = 0.22
  const scarfTail = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 6, 8), M('#ff9bb0', { roughness: 0.72 }))
  scarfTail.position.set(0.06, 0.14, 0.05)
  const scarfTail2 = scarfTail.clone()
  scarfTail2.position.set(0.08, 0.1, 0.03)
  scarfTail2.rotation.z = 0.4
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.018, 20), M('#c94c4c', { roughness: 0.65 }))
  hatBrim.position.y = 0.34
  const hatTop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 16), M('#e85d4c', { roughness: 0.62 }))
  hatTop.position.y = 0.44
  const band = ball(0.028, '#fff6e8', { roughness: 0.8 }, 10)
  band.position.y = 0.52
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.055, 12), M('#f77f00', { roughness: 0.5 }))
  nose.rotation.x = Math.PI / 2
  nose.position.set(0, 0.275, 0.075)
  const eyeL = ball(0.011, '#3a322c', {}, 10)
  eyeL.position.set(-0.022, 0.29, 0.06)
  const eyeR = eyeL.clone()
  eyeR.position.x = 0.022
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI), M('#3a322c'))
  smile.position.set(0, 0.255, 0.062)
  smile.rotation.x = Math.PI
  // 手臂
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.14, 8), M('#6d4c41', { roughness: 0.85 }))
    arm.rotation.z = s * 1.0
    arm.position.set(s * 0.12, 0.16, 0)
    g.add(arm)
  }
  for (const yy of [0.14, 0.09, 0.04]) {
    const btn = ball(0.014, '#4a4038', { metalness: 0.3 }, 10)
    btn.position.set(0, yy, 0.105)
    g.add(btn)
  }
  g.add(body, belly, head, scarf, scarfTail, scarfTail2, hatBrim, hatTop, band, nose, eyeL, eyeR, smile)
  return g
}

function deerPlaque() {
  const g = new THREE.Group()
  const wood = M('#b08968', { roughness: 0.82 })
  const board = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 6), wood)
  board.rotation.x = Math.PI / 2
  // 木紋邊框
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.012, 8, 6), M('#7f5539', { roughness: 0.85 }))
  rim.rotation.x = Math.PI / 2
  rim.position.z = 0.01
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 14), M('#7f5539', { roughness: 0.78 }))
  head.position.set(0, 0.02, 0.04)
  const snout = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.04, 6, 12), M('#9c6644', { roughness: 0.78 }))
  snout.rotation.x = Math.PI / 2
  snout.position.set(0, -0.01, 0.09)
  const nose = ball(0.012, '#3a322c', { roughness: 0.5 }, 10)
  nose.position.set(0, -0.01, 0.12)
  for (const s of [-1, 1]) {
    const antlerRoot = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.1, 10), M('#d4a373', { roughness: 0.65 }))
    antlerRoot.position.set(s * 0.035, 0.1, 0.04)
    antlerRoot.rotation.z = s * 0.35
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.08, 8), M('#d4a373', { roughness: 0.65 }))
    branch1.position.set(s * 0.06, 0.16, 0.04)
    branch1.rotation.z = s * 0.9
    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.055, 8), M('#d4a373', { roughness: 0.65 }))
    branch2.position.set(s * 0.09, 0.13, 0.05)
    branch2.rotation.z = s * 1.3
    g.add(antlerRoot, branch1, branch2)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 10), M('#7f5539', { roughness: 0.78 }))
    ear.scale.set(0.7, 1.2, 0.5)
    ear.position.set(s * 0.055, 0.055, 0.04)
    g.add(ear)
  }
  const eyeL = ball(0.008, '#3a322c', {}, 8)
  eyeL.position.set(-0.02, 0.03, 0.085)
  const eyeR = eyeL.clone()
  eyeR.position.x = 0.02
  g.add(board, rim, head, snout, nose, eyeL, eyeR)
  return g
}

function baubleBase(color: string, glow?: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const g = new THREE.Group()
  const ballMesh = ball(0.15, color, { metalness: 0.35, roughness: 0.35, ...glowOpts(glow, 0.5), ...opts }, 40)
  const highlight = ball(0.035, '#ffffff', { transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0 }, 12)
  highlight.position.set(0.06, 0.08, 0.1)
  g.add(ballMesh, highlight, hangCap(0.165))
  return g
}

function createBauble(def: DecorDef, glow?: string): THREE.Object3D {
  switch (def.id) {
    case 'orb_red': {
      // 範例：高光紅球 + 金雪花紋
      const g = baubleBase('#c62828', glow, { metalness: 0.55, roughness: 0.22 })
      const flake = extrudeStar(0.08, 0.035, 0.012, '#ffd27a', { metalness: 0.75, roughness: 0.28 })
      flake.position.set(0, 0, 0.145)
      flake.scale.setScalar(0.85)
      const flake2 = flake.clone()
      flake2.rotation.y = Math.PI
      flake2.position.z = -0.145
      g.add(flake, flake2)
      return g
    }
    case 'orb_gold': {
      // 多瓣金箔南瓜球
      const g = new THREE.Group()
      for (let i = 0; i < 6; i++) {
        const lobe = ball(0.095, '#e8a84a', { metalness: 0.7, roughness: 0.28, ...glowOpts(glow, 0.4) }, 20)
        const a = (i / 6) * Math.PI * 2
        lobe.position.set(Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07)
        g.add(lobe)
      }
      g.add(ball(0.08, '#ffd27a', { metalness: 0.75, roughness: 0.25, ...glowOpts(glow, 0.45) }, 18), hangCap(0.17))
      return g
    }
    case 'orb_ice': {
      // 水滴冰晶球
      const g = new THREE.Group()
      const drop = ball(0.13, '#d6eaf7', {
        roughness: 0.18,
        metalness: 0.08,
        transparent: true,
        opacity: 0.75,
        ...glowOpts(glow ?? '#e8f2fa', glow ? 0.55 : 0.12),
      }, 28)
      drop.scale.set(1, 1.35, 1)
      const core = ball(0.05, '#fff6e8', { ...glowOpts('#cfe6f5', 0.4) }, 14)
      core.position.y = 0.02
      g.add(drop, core, hangCap(0.2))
      return g
    }
    case 'orb_candy': {
      // 範例：粉紅雪花球
      const g = baubleBase('#ff9bb0', glow, { metalness: 0.4, roughness: 0.3 })
      const flake = extrudeStar(0.075, 0.032, 0.01, '#ffffff', { metalness: 0.35, roughness: 0.4 })
      flake.position.set(0, 0, 0.145)
      flake.scale.setScalar(0.8)
      g.add(flake)
      return g
    }
    case 'orb_silver': {
      // 奶油雪球＋立體雪花瓣
      const g = baubleBase('#eef2f7', glow, { metalness: 0.45, roughness: 0.45 })
      for (let i = 0; i < 6; i++) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 10, 8),
          M('#fff6e8', { roughness: 0.55, metalness: 0.2 }),
        )
        petal.scale.set(0.45, 1.1, 0.25)
        const a = (i / 6) * Math.PI * 2
        petal.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.12)
        petal.rotation.z = a
        g.add(petal)
      }
      return g
    }
    case 'orb_lantern': {
      // 圓肚紙燈籠
      const g = new THREE.Group()
      const belly = ball(0.13, '#ffb347', { roughness: 0.62, ...glowOpts(glow ?? '#ffb347', glow ? 0.75 : 0.18) }, 28)
      belly.scale.set(1.05, 1.2, 1.05)
      const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 24), M('#8b5a2b', { roughness: 0.7 }))
      const ridge2 = ridge.clone()
      ridge2.position.y = 0.06
      ridge.position.y = -0.05
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.06, 12), M('#6d4c41', { roughness: 0.72 }))
      top.position.y = 0.16
      const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.05, 12), M('#6d4c41', { roughness: 0.72 }))
      bottom.position.y = -0.15
      g.add(belly, ridge, ridge2, top, bottom, hangCap(0.2))
      return g
    }
    case 'orb_green': {
      // 薄荷葉瓣球
      const g = baubleBase('#5aad8c', glow, { metalness: 0.4, roughness: 0.35 })
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 10),
          M('#3d7a5a', { roughness: 0.65 }),
        )
        leaf.scale.set(0.45, 1.2, 0.2)
        const a = (i / 5) * Math.PI * 2
        leaf.position.set(Math.cos(a) * 0.14, 0.02, Math.sin(a) * 0.14)
        leaf.rotation.y = a
        leaf.rotation.z = 0.4
        g.add(leaf)
      }
      return g
    }
    case 'orb_galaxy': {
      // 夜空葫蘆球
      const g = new THREE.Group()
      const lower = ball(0.12, '#4a5d8a', { metalness: 0.3, roughness: 0.42, ...glowOpts(glow, 0.4) }, 28)
      lower.position.y = -0.04
      const upper = ball(0.08, '#3d5070', { metalness: 0.3, roughness: 0.4, ...glowOpts(glow, 0.35) }, 22)
      upper.position.y = 0.1
      for (let i = 0; i < 14; i++) {
        const star = ball(0.012, '#ffd27a', { emissive: '#ffd27a', emissiveIntensity: 0.7 }, 6)
        const phi = Math.acos(2 * Math.random() - 1)
        const theta = Math.random() * Math.PI * 2
        const rr = i % 2 ? 0.11 : 0.075
        star.position.set(
          rr * Math.sin(phi) * Math.cos(theta),
          (i % 2 ? -0.04 : 0.1) + rr * Math.cos(phi) * 0.5,
          rr * Math.sin(phi) * Math.sin(theta),
        )
        g.add(star)
      }
      g.add(lower, upper, hangCap(0.2))
      return g
    }
    default:
      return baubleBase(def.swatch, glow)
  }
}

function createCharm(def: DecorDef, glow?: string): THREE.Object3D {
  const g = new THREE.Group()
  switch (def.id) {
    case 'ch_cane':
      g.add(candyCane(glow))
      break
    case 'ch_bow':
      g.add(velvetBow('#c94c4c', 1, glow))
      break
    case 'ch_bell':
      g.add(goldenBell(-0.09, glow), goldenBell(0.09, glow))
      break
    case 'ch_gingerbread':
      g.add(gingerbread())
      break
    case 'ch_sock':
      g.add(christmasSock())
      break
    case 'ch_pinecone':
      g.add(pineCone())
      break
    case 'ch_holly':
      g.add(holly())
      break
    case 'ch_drum':
      g.add(miniDrum())
      break
    case 'ch_snowman':
      g.add(snowman())
      break
    case 'ch_deer':
      g.add(deerPlaque())
      break
    default:
      g.add(baubleBase(def.swatch, glow))
  }
  g.add(hangCap(0.22))
  return g
}

function createTopper(def: DecorDef, glow?: string): THREE.Object3D {
  const g = new THREE.Group()
  if (def.id === 'top_star') {
    // 雙層胖星星：擠出在 XY 平面，尖頂已朝 +Y；立起來面對相機
    const back = extrudeStar(0.48, 0.2, 0.05, '#e8a84a', {
      metalness: 0.55,
      roughness: 0.3,
      ...glowOpts(glow ?? '#ffd27a', glow ? 0.55 : 0.15),
    })
    back.position.z = -0.03
    const star = extrudeStar(0.42, 0.18, 0.1, '#ffd27a', {
      metalness: 0.65,
      roughness: 0.25,
      ...glowOpts(glow ?? '#ffd27a', glow ? 0.8 : 0.25),
    })
    // 確保尖角朝上（若被其他旋轉弄翻，強制校正）
    back.rotation.set(0, 0, 0)
    star.rotation.set(0, 0, 0)
    const center = ball(0.08, '#fff6e8', { ...glowOpts('#ffd27a', glow ? 0.6 : 0.2) }, 14)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.2, 10), M('#c49a6c', { roughness: 0.7 }))
    stem.position.y = -0.32
    g.add(back, star, center, stem)
    return g
  }
  if (def.id === 'top_snowflake') {
    // 圓潤花瓣雪花
    const ice = M('#cfe6f5', { metalness: 0.25, roughness: 0.35, ...glowOpts(glow ?? '#e8f2fa', glow ? 0.65 : 0.15) })
    for (let i = 0; i < 6; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), ice)
      petal.scale.set(0.35, 1.5, 0.35)
      const a = (i / 6) * Math.PI * 2
      petal.position.set(Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0)
      petal.rotation.z = a
      g.add(petal)
      const tip = ball(0.045, '#fff6e8', { ...glowOpts('#ffffff', 0.35) }, 10)
      tip.position.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0)
      g.add(tip)
    }
    g.add(ball(0.09, '#f0f7fc', { ...glowOpts('#ffffff', 0.45) }, 16))
    return g
  }
  if (def.id === 'top_angel') {
    // Q 版童話小天使
    const dress = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 18), M('#fff1c1', { roughness: 0.55, ...glowOpts(glow, 0.28) }))
    dress.scale.set(1.1, 1.25, 1.1)
    dress.position.y = -0.02
    const head = ball(0.095, '#ffe0c2', { roughness: 0.58 }, 24)
    head.position.y = 0.22
    const bun = ball(0.05, '#f4a261', { roughness: 0.75 }, 14)
    bun.position.set(0, 0.3, -0.02)
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.018, 12, 28),
      M('#ffd27a', { metalness: 0.7, ...glowOpts('#ffd27a', glow ? 0.75 : 0.28) }),
    )
    halo.rotation.x = Math.PI / 2
    halo.position.y = 0.36
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 18, 14),
        M('#fff6e8', { roughness: 0.5, transparent: true, opacity: 0.95 }),
      )
      wing.scale.set(0.35, 1.15, 0.7)
      wing.position.set(s * 0.2, 0.08, -0.05)
      wing.rotation.z = s * 0.55
      g.add(wing)
    }
    g.add(dress, head, bun, halo)
    return g
  }
  // top_bow — 更大更圓的童話結
  g.add(velvetBow('#e85d4c', 1.85, glow))
  for (const s of [-1, 1]) {
    const ribbon = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.05, 0.35, 6, 10),
      M('#e85d4c', { roughness: 0.65 }),
    )
    ribbon.position.set(s * 0.14, -0.38, 0)
    ribbon.rotation.z = s * 0.35
    g.add(ribbon)
  }
  return g
}

function roundedBox(w: number, h: number, d: number, r: number, color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  // 用圓角近似：主體 + 邊角球，視覺比硬方塊精緻
  const g = new THREE.Group()
  const core = new THREE.Mesh(new THREE.BoxGeometry(w - r * 2, h, d - r * 2), M(color, opts))
  const midX = new THREE.Mesh(new THREE.BoxGeometry(w, h - r * 2, d - r * 2), M(color, opts))
  const midZ = new THREE.Mesh(new THREE.BoxGeometry(w - r * 2, h - r * 2, d), M(color, opts))
  g.add(core, midX, midZ)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h - r * 2, 10), M(color, opts))
      edge.position.set(sx * (w / 2 - r), 0, sz * (d / 2 - r))
      g.add(edge)
      for (const sy of [-1, 1]) {
        const corner = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), M(color, opts))
        corner.position.set(sx * (w / 2 - r), sy * (h / 2 - r), sz * (d / 2 - r))
        g.add(corner)
        const e2 = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w - r * 2, 10), M(color, opts))
        e2.rotation.z = Math.PI / 2
        e2.position.set(0, sy * (h / 2 - r), sz * (d / 2 - r))
        g.add(e2)
      }
    }
  }
  return g
}

function giftBox(s: number, color: string, ribbon: string, x: number, z: number) {
  const g = new THREE.Group()
  const box = roundedBox(s, s, s, s * 0.06, color, { roughness: 0.52 })
  box.position.y = s / 2
  const lid = roundedBox(s * 1.06, s * 0.14, s * 1.06, s * 0.05, color, { roughness: 0.48 })
  lid.position.y = s * 0.98
  const bandV = new THREE.Mesh(new THREE.BoxGeometry(s * 0.14, s * 1.08, s * 1.04), M(ribbon, { roughness: 0.4, metalness: 0.15 }))
  bandV.position.y = s / 2
  const bandH = new THREE.Mesh(new THREE.BoxGeometry(s * 1.04, s * 0.14, s * 1.04), M(ribbon, { roughness: 0.4, metalness: 0.15 }))
  bandH.position.y = s * 0.58
  const bow = velvetBow(ribbon, 1)
  bow.position.y = s * 1.12
  bow.scale.setScalar(s * 2.4)
  g.add(box, lid, bandV, bandH, bow)
  g.position.set(x, 0, z)
  return g
}

function trainWheel(r = 0.055) {
  const g = new THREE.Group()
  const tire = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.28, 10, 24), M('#3a322c', { roughness: 0.7 }))
  tire.rotation.y = Math.PI / 2
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.35, r * 0.35, 14), M('#c4b8a8', { metalness: 0.7, roughness: 0.35 }))
  hub.rotation.z = Math.PI / 2
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(r * 0.12, r * 1.5, r * 0.12), M('#9a8a78', { metalness: 0.5, roughness: 0.4 }))
    spoke.rotation.z = (i / 6) * Math.PI
    g.add(spoke)
  }
  g.add(tire, hub)
  return g
}

function placeOnCircle(obj: THREE.Object3D, radius: number, angle: number, y = 0) {
  obj.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
  obj.rotation.y = -angle + Math.PI / 2
}

function makeLocomotive(powered: boolean) {
  const eng = new THREE.Group()
  const blue = M('#6b8fad', { roughness: 0.45, metalness: 0.15 })
  const red = M('#e85d4c', { roughness: 0.5 })
  const gold = M('#ffd27a', { metalness: 0.55, roughness: 0.35 })

  // 玩具火車：圓潤底盤
  const chassis = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.32, 6, 12), M('#c49a6c', { roughness: 0.7 }))
  chassis.rotation.z = Math.PI / 2
  chassis.position.set(0, 0.1, 0)
  // 圓肚鍋爐
  const boiler = ball(0.12, '#6b8fad', { roughness: 0.4, ...glowOpts(powered ? '#9ad4ef' : undefined, powered ? 0.3 : 0) }, 20)
  boiler.scale.set(1.4, 1, 1)
  boiler.position.set(0.06, 0.24, 0)
  const nose = ball(0.1, '#7ba3c4', { roughness: 0.4 }, 16)
  nose.position.set(0.22, 0.24, 0)
  // 煙囪
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 16), M('#3a322c', { roughness: 0.55 }))
  funnel.position.set(0.12, 0.38, 0)
  const funnelRim = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.04, 16), M('#3a322c'))
  funnelRim.position.set(0.12, 0.47, 0)
  // 駕駛室
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.26), blue)
  cabin.position.set(-0.16, 0.28, 0)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.28), red)
  roof.position.set(-0.16, 0.4, 0)
  // 窗戶
  for (const z of [-0.09, 0.09]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.07), M('#cfe6f5', { transparent: true, opacity: 0.75, roughness: 0.15, metalness: 0.2, ...glowOpts(powered ? '#e8f2fa' : undefined, powered ? 0.35 : 0) }))
    win.position.set(-0.16, 0.3, z)
    eng.add(win)
  }
  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.14), M('#cfe6f5', { transparent: true, opacity: 0.75, roughness: 0.15 }))
  frontWin.position.set(-0.06, 0.3, 0)
  // 排障器
  const cow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 4), gold)
  cow.rotation.z = Math.PI / 2
  cow.rotation.y = Math.PI / 4
  cow.position.set(0.32, 0.1, 0)
  cow.scale.set(1, 0.45, 1)
  // 頭燈
  const lamp = ball(0.03, '#ffd27a', { ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.8 : 0) }, 14)
  lamp.position.set(0.28, 0.28, 0)
  // 輪子
  for (const [x, z] of [
    [0.14, 0.14],
    [-0.06, 0.14],
    [-0.22, 0.14],
    [0.14, -0.14],
    [-0.06, -0.14],
    [-0.22, -0.14],
  ] as const) {
    const w = trainWheel(0.055)
    w.position.set(x, 0.055, z)
    eng.add(w)
  }
  // 連桿
  const rod = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.02), gold)
  rod.position.set(0.02, 0.06, 0.15)
  eng.add(chassis, boiler, nose, funnel, funnelRim, cabin, roof, frontWin, cow, lamp, rod)
  return eng
}

function makeCarriage(color: string, powered: boolean) {
  const car = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.24), M(color, { roughness: 0.45 }))
  body.position.y = 0.2
  const roof = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 6, 12), M('#fff5f5', { roughness: 0.55 }))
  roof.rotation.z = Math.PI / 2
  roof.position.y = 0.34
  roof.scale.set(1, 0.55, 1.05)
  // 窗
  for (const x of [-0.1, 0.1]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.07, 0.02),
      M('#cfe6f5', { transparent: true, opacity: 0.8, roughness: 0.15, ...glowOpts(powered ? '#e8f2fa' : undefined, powered ? 0.3 : 0) }),
    )
    win.position.set(x, 0.22, 0.125)
    car.add(win)
    const winB = win.clone()
    winB.position.z = -0.125
    car.add(winB)
  }
  // 門
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.02), M('#3a322c', { roughness: 0.5 }))
  door.position.set(0, 0.2, 0.125)
  // 輪
  for (const [x, z] of [
    [0.1, 0.13],
    [-0.1, 0.13],
    [0.1, -0.13],
    [-0.1, -0.13],
  ] as const) {
    const w = trainWheel(0.045)
    w.position.set(x, 0.045, z)
    car.add(w)
  }
  // 連結器
  const hitch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.03), M('#c4b8a8', { metalness: 0.6 }))
  hitch.position.set(0.2, 0.14, 0)
  car.add(body, roof, door, hitch)
  return car
}

function makeCaboose(powered: boolean) {
  const car = makeCarriage('#c94c4c', powered)
  const cupola = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.18), M('#e85d4c', { roughness: 0.45 }))
  cupola.position.y = 0.42
  const cupolaWin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), M('#cfe6f5', { transparent: true, opacity: 0.8 }))
  cupolaWin.position.set(0, 0.42, 0.1)
  car.add(cupola, cupolaWin)
  return car
}

function createTrainSet(powered: boolean) {
  const g = new THREE.Group()
  const R = 1.45
  const sleeperMat = M('#6d4c41', { roughness: 0.9 })
  const railMat = M('#ced4da', { metalness: 0.75, roughness: 0.32 })

  // 雙軌
  for (const rr of [R - 0.07, R + 0.07]) {
    const rail = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.018, 12, 96), railMat)
    rail.rotation.x = Math.PI / 2
    rail.position.y = 0.045
    g.add(rail)
  }
  // 枕木
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.07), sleeperMat)
    sleeper.position.set(Math.cos(a) * R, 0.018, Math.sin(a) * R)
    sleeper.rotation.y = -a
    g.add(sleeper)
  }
  // 道碴感圓環
  const bed = new THREE.Mesh(new THREE.TorusGeometry(R, 0.12, 10, 80), M('#8d99ae', { roughness: 0.95 }))
  bed.rotation.x = Math.PI / 2
  bed.position.y = 0.005
  bed.scale.set(1, 1, 0.35)
  g.add(bed)

  const trainRoot = new THREE.Group()
  trainRoot.name = 'trainCars'

  const loco = makeLocomotive(powered)
  placeOnCircle(loco, R, 0, 0)
  trainRoot.add(loco)

  const cars = [
    { ang: -0.42, color: '#e85d4c', caboose: false },
    { ang: -0.84, color: '#5aad8c', caboose: false },
    { ang: -1.26, color: '#ffd27a', caboose: false },
    { ang: -1.68, color: '#c94c4c', caboose: true },
  ]
  for (const c of cars) {
    const car = c.caboose ? makeCaboose(powered) : makeCarriage(c.color, powered)
    placeOnCircle(car, R, c.ang, 0)
    trainRoot.add(car)
  }
  g.add(trainRoot)
  g.userData.spinTrain = true
  return g
}

function createTreeSkirt() {
  const g = new THREE.Group()
  // 波浪裙襬：多層圓盤 + 褶邊球
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.85, 0.1, 64), M('#c94c4c', { roughness: 0.88 }))
  base.position.y = 0.05
  g.add(base)
  for (let ring = 0; ring < 5; ring++) {
    const rad = 1.25 + ring * 0.12
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(rad, 0.04, 10, 64),
      M(ring % 2 === 0 ? '#fff5f5' : '#e85d4c', { roughness: 0.8 }),
    )
    stripe.rotation.x = Math.PI / 2
    stripe.position.y = 0.11
    g.add(stripe)
  }
  // 外圈褶邊
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const puff = ball(0.09, i % 2 ? '#fff5f5' : '#c94c4c', { roughness: 0.85 }, 14)
    puff.scale.set(1.1, 0.55, 1.1)
    puff.position.set(Math.cos(a) * 1.78, 0.08, Math.sin(a) * 1.78)
    g.add(puff)
  }
  return g
}

function createBase(def: DecorDef, powered: boolean): THREE.Object3D {
  const g = new THREE.Group()
  if (def.id === 'base_skirt') {
    g.add(createTreeSkirt())
    return g
  }
  if (def.id === 'base_train') {
    g.add(createTrainSet(powered))
    return g
  }
  if (def.id === 'base_gift_luxury') {
    g.add(
      giftBox(0.52, '#f8f1e3', '#ffd27a', -0.7, 0.4),
      giftBox(0.4, '#ffffff', '#e8a84a', 0.55, 0.2),
      giftBox(0.32, '#fff8e7', '#e85d4c', 0.05, -0.7),
    )
    return g
  }
  g.add(
    giftBox(0.5, '#e85d4c', '#ffd27a', -0.65, 0.45),
    giftBox(0.38, '#5aad8c', '#fff5f5', 0.55, 0.25),
    giftBox(0.3, '#ffd27a', '#e85d4c', 0.1, -0.6),
  )
  return g
}

function stringBulb(def: DecorDef, color: string, powered: boolean): THREE.Object3D {
  const g = new THREE.Group()
  if (def.id === 'str_star') {
    g.add(extrudeStar(0.07, 0.03, 0.02, color, { ...glowOpts(powered ? color : undefined, 0.9) }))
    return g
  }
  if (def.id === 'str_candle') {
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.08, 12), M('#fff8f0', { roughness: 0.6 }))
    const flame = ball(0.022, '#ffb347', { ...glowOpts(powered ? '#ff9f1c' : undefined, powered ? 1.0 : 0) }, 12)
    flame.scale.set(0.7, 1.3, 0.7)
    flame.position.y = 0.06
    g.add(wax, flame)
    return g
  }
  if (def.id === 'str_neon') {
    // 愛心小燈
    const heart = ball(0.04, color, { roughness: 0.35, ...glowOpts(powered ? color : undefined, powered ? 0.95 : 0) }, 12)
    heart.scale.set(1, 0.9, 0.55)
    g.add(heart)
    return g
  }
  // 圓潤童話燈泡
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.048, 16, 12),
    M(color, { roughness: 0.3, metalness: 0.1, ...glowOpts(powered ? color : undefined, powered ? 1.0 : 0.08) }),
  )
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.022, 10), M('#c49a6c', { roughness: 0.6 }))
  base.position.y = -0.04
  g.add(glass, base)
  return g
}

export function createStringPreviewMesh(def: DecorDef, glow?: string): THREE.Object3D {
  const g = new THREE.Group()
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.28, 0, 0),
        new THREE.Vector3(-0.1, 0.04, 0),
        new THREE.Vector3(0.1, -0.03, 0),
        new THREE.Vector3(0.28, 0.02, 0),
      ]),
      20,
      0.008,
      6,
      false,
    ),
    M(Theme.wire, { roughness: 0.8 }),
  )
  g.add(wire)
  for (let i = 0; i < 5; i++) {
    const color =
      def.colorFamily === 'mixed'
        ? Theme.mixed[i]!
        : def.swatch
    const bulb = stringBulb(def, color, !!glow)
    bulb.position.set(i * 0.13 - 0.26, Math.sin(i * 1.2) * 0.03, 0)
    g.add(bulb)
  }
  return g
}

export function createStringBulbAt(def: DecorDef, color: string, powered: boolean): THREE.Object3D {
  return stringBulb(def, color, powered)
}

/**
 * 童話裝置：去工業感，改成故事書道具
 * 發光規則不變（造雪／泡泡本體不爆光）
 */
function createDevice(def: DecorDef, powered: boolean): THREE.Object3D {
  const g = new THREE.Group()
  const stand = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), M('#c49a6c', { roughness: 0.85 }))
  stand.scale.set(1, 0.32, 1)
  stand.position.y = 0.08
  g.add(stand)

  if (def.id === 'dev_snow') {
    // 棉花雲造雪壺
    const pot = ball(0.32, '#fff6e8', { roughness: 0.75 }, 24)
    pot.position.y = 0.42
    pot.scale.set(1.1, 0.85, 1.1)
    const cloud = ball(0.28, '#eef2f7', { roughness: 0.9 }, 20)
    cloud.position.set(0, 0.72, 0.05)
    const cloud2 = ball(0.18, '#fff6e8', { roughness: 0.9 }, 16)
    cloud2.position.set(0.18, 0.7, 0.12)
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.28, 12), M('#cfe6f5', { roughness: 0.5 }))
    nozzle.rotation.x = -THREE.MathUtils.degToRad(50)
    nozzle.position.set(0, 0.85, 0.28)
    const spout = new THREE.Object3D()
    spout.name = 'fxSpout'
    spout.position.set(0, 1.0, 0.48)
    g.add(pot, cloud, cloud2, nozzle, spout)
    g.userData.fxKind = 'snow'
    g.userData.emitsLight = false
  } else if (def.id === 'dev_bubble') {
    // 圓肚壺＋泡泡杖
    const pot = ball(0.28, '#b8a4e8', { roughness: 0.55 }, 24)
    pot.position.y = 0.4
    pot.scale.set(1.05, 1.15, 1.05)
    const lid = ball(0.14, '#8f6bc7', { roughness: 0.5 }, 16)
    lid.position.y = 0.68
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI), M('#8f6bc7', { roughness: 0.5 }))
    handle.position.set(-0.28, 0.45, 0)
    handle.rotation.y = Math.PI / 2
    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.32, 10), M('#c9a0dc', { roughness: 0.45 }))
    wand.rotation.x = -THREE.MathUtils.degToRad(40)
    wand.position.set(0, 0.85, 0.18)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 18), M('#fff6e8', { roughness: 0.4 }))
    ring.position.set(0, 1.0, 0.35)
    ring.rotation.x = -THREE.MathUtils.degToRad(40)
    const spout = new THREE.Object3D()
    spout.name = 'fxSpout'
    spout.position.set(0, 1.05, 0.4)
    g.add(pot, lid, handle, wand, ring, spout)
    g.userData.fxKind = 'bubble'
    g.userData.emitsLight = false
  } else if (def.id === 'dev_spot') {
    // 彎柄童話提燈
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.55, 12), M('#c49a6c', { roughness: 0.7 }))
    pole.position.y = 0.35
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 20, Math.PI * 1.2), M('#c49a6c', { roughness: 0.7 }))
    hook.position.set(0.08, 0.78, 0)
    hook.rotation.z = -0.4
    const lantern = ball(0.16, '#ffd27a', {
      roughness: 0.45,
      ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.7 : 0.08),
    }, 20)
    lantern.position.set(0.22, 0.62, 0.12)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.14, 12), M('#c94c4c', { roughness: 0.65 }))
    roof.position.set(0.22, 0.78, 0.12)
    g.add(pole, hook, lantern, roof)
    g.userData.fxKind = 'spot'
    g.userData.emitsLight = true
  } else if (def.id === 'dev_sign') {
    // 拱形故事書木牌
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.85, 10), M('#8d6e63', { roughness: 0.8 }))
    post.position.y = 0.42
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.1), M('#fff6e8', { roughness: 0.7 }))
    board.position.y = 0.95
    const arch = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      M('#fff6e8', { roughness: 0.7 }),
    )
    arch.scale.set(1, 0.55, 0.18)
    arch.position.set(0, 1.28, 0)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.78, 0.06), M('#c49a6c', { roughness: 0.75 }))
    frame.position.y = 0.95
    frame.position.z = -0.02
    g.add(post, frame, board, arch)
    const neon = M('#ff8fa3', { ...glowOpts(powered ? '#ff8fa3' : undefined, powered ? 0.95 : 0), roughness: 0.35 })
    // 愛心＋星星圖示
    const heart = ball(0.1, '#ff8fa3', { ...glowOpts(powered ? '#ff8fa3' : undefined, powered ? 0.8 : 0) }, 12)
    heart.position.set(-0.28, 0.95, 0.08)
    heart.scale.set(1, 0.9, 0.5)
    const star = extrudeStar(0.16, 0.07, 0.04, '#ffd27a', { ...glowOpts(powered ? '#ffd27a' : undefined, powered ? 0.85 : 0) })
    star.position.set(0.25, 0.98, 0.08)
    star.scale.setScalar(0.85)
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.04), neon)
    bar.position.set(0, 0.72, 0.08)
    g.add(heart, star, bar)
    g.userData.fxKind = 'sign'
    g.userData.emitsLight = true
  } else if (def.id === 'dev_deer') {
    // 圓潤絨毛小鹿＋雪橇
    const fur = M('#e8c9a0', { roughness: 0.82, ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.2 : 0) })
    const body = ball(0.18, '#e8c9a0', { roughness: 0.82, ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.2 : 0) }, 20)
    body.scale.set(1.5, 1, 1)
    body.position.set(0.08, 0.52, 0)
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.14, 6, 10), fur)
    neck.position.set(0.28, 0.68, 0)
    neck.rotation.z = -0.55
    const head = ball(0.09, '#f0d2b0', { roughness: 0.8 }, 16)
    head.position.set(0.4, 0.8, 0)
    for (const s of [-1, 1]) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.16, 6), M('#c49a6c', { roughness: 0.7 }))
      ant.position.set(0.38, 0.95, s * 0.04)
      ant.rotation.z = s * 0.28
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.08, 6), M('#c49a6c', { roughness: 0.7 }))
      branch.position.set(0.34, 1.0, s * 0.07)
      branch.rotation.z = s * 0.9
      g.add(ant, branch)
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.28, 8), fur)
      leg.position.set(s * 0.08 + 0.05, 0.22, 0.06)
      g.add(leg)
    }
    const sled = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.3), M('#e85d4c', { roughness: 0.6 }))
    sled.position.set(-0.28, 0.28, 0)
    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI), M('#e85d4c', { roughness: 0.6 }))
    curl.position.set(-0.52, 0.35, 0)
    curl.rotation.y = Math.PI / 2
    g.add(body, neck, head, sled, curl)
    g.userData.fxKind = 'deer'
    g.userData.emitsLight = false
  } else if (def.id === 'dev_fire') {
    // 圓石篝火
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const rock = ball(0.1, i % 2 ? '#9a8a78' : '#7a6a5a', { roughness: 0.92 }, 10)
      rock.scale.set(1, 0.7, 1)
      rock.position.set(Math.cos(a) * 0.32, 0.12, Math.sin(a) * 0.32)
      g.add(rock)
    }
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.4, 10), M('#7f5539', { roughness: 0.9 }))
    log1.rotation.z = 1.0
    log1.position.set(0, 0.28, 0)
    const log2 = log1.clone()
    log2.rotation.y = 1.2
    const flame = ball(0.15, '#ff8a3a', { ...glowOpts(powered ? '#ff9f1c' : undefined, powered ? 1.0 : 0) }, 16)
    flame.scale.set(0.75, 1.55, 0.75)
    flame.position.y = 0.55
    const flame2 = ball(0.08, '#ffd27a', { ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.9 : 0) }, 12)
    flame2.position.y = 0.72
    const spout = new THREE.Object3D()
    spout.name = 'fxSpout'
    spout.position.set(0, 0.65, 0)
    g.add(log1, log2, flame, flame2, spout)
    g.userData.fxKind = 'fire'
    g.userData.emitsLight = true
  } else if (def.id === 'dev_speaker') {
    // 童話音樂盒
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.45), M('#c94c4c', { roughness: 0.55 }))
    box.position.y = 0.32
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.48), M('#e85d4c', { roughness: 0.5 }))
    lid.position.set(0, 0.52, -0.05)
    lid.rotation.x = -0.35
    const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8), M('#ffd27a', { metalness: 0.5, roughness: 0.35 }))
    crank.rotation.z = Math.PI / 2
    crank.position.set(0.35, 0.35, 0)
    const knob = ball(0.04, '#ffd27a', { metalness: 0.5 }, 10)
    knob.position.set(0.45, 0.35, 0)
    const dancer = ball(0.07, '#fff1c1', { ...glowOpts(powered ? '#ffd27a' : undefined, powered ? 0.45 : 0) }, 14)
    dancer.position.set(0, 0.72, 0)
    const note = extrudeStar(0.09, 0.035, 0.02, '#ffd27a', { ...glowOpts(powered ? '#ffd27a' : undefined, powered ? 0.6 : 0) })
    note.position.set(0.28, 0.95, 0)
    const spout = new THREE.Object3D()
    spout.name = 'fxSpout'
    spout.position.set(0, 1.05, 0)
    g.add(box, lid, crank, knob, dancer, note, spout)
    g.userData.fxKind = 'speaker'
    g.userData.emitsLight = false
  } else {
    // 金粉花精靈噴泉
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      M('#e8a84a', { metalness: 0.45, roughness: 0.4 }),
    )
    bowl.position.y = 0.35
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.35, 12), M('#c49a6c', { roughness: 0.7 }))
    stem.position.y = 0.22
    const flower = ball(0.12, '#ff9bb0', { ...glowOpts(powered ? '#ffd27a' : undefined, powered ? 0.55 : 0) }, 16)
    flower.position.y = 0.72
    for (let i = 0; i < 5; i++) {
      const petal = ball(0.07, '#ffd27a', { ...glowOpts(powered ? '#ffe08a' : undefined, powered ? 0.7 : 0) }, 10)
      const a = (i / 5) * Math.PI * 2
      petal.position.set(Math.cos(a) * 0.12, 0.7, Math.sin(a) * 0.12)
      g.add(petal)
    }
    const spout = new THREE.Object3D()
    spout.name = 'fxSpout'
    spout.position.set(0, 0.9, 0)
    g.add(stem, bowl, flower, spout)
    g.userData.fxKind = 'fountain'
    g.userData.emitsLight = true
  }

  const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.2, 0), 0.9, 0xffd27a, 0.2, 0.15)
  arrow.visible = false
  arrow.name = 'aimArrow'
  g.add(arrow)
  g.userData.deviceId = def.id
  return g
}

/** 對外：依定義產出高細節 Q 版模型 */
export function createDetailedDecorMesh(def: DecorDef, powered = false): THREE.Object3D {
  const glow = powered ? def.swatch : undefined
  switch (def.kind) {
    case 'ornament':
      if (def.category === 'baubles') return createBauble(def, glow)
      return createCharm(def, glow)
    case 'topper':
      return createTopper(def, glow)
    case 'base':
      return createBase(def, powered)
    case 'string':
      return createStringPreviewMesh(def, glow)
    case 'device':
      return createDevice(def, powered)
    default:
      return baubleBase(def.swatch, glow)
  }
}
