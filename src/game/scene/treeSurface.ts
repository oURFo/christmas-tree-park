import * as THREE from 'three'
import { TREE_LAYER_DEFS } from './treeLayers'

/** 依樹高估算外輪廓（輪生下垂枝） */
export function treeRadiusAtY(y: number): number {
  if (y < 0.5) return 0.35
  if (y > 6.9) return 0.1

  let best = 0.16
  for (const layer of TREE_LAYER_DEFS) {
    const droop = layer.droop
    // 枝條下垂後，最寬處約在層高下方
    const dy = y - layer.y
    if (dy < -droop - 0.25 || dy > 0.35) continue
    const t = THREE.MathUtils.clamp(1 - Math.abs(dy + droop * 0.55) / (droop + 0.45), 0, 1)
    const r = layer.r * (0.45 + 0.55 * t)
    best = Math.max(best, r)
  }
  // 頂芽
  if (y > 5.9) best = Math.max(best, 0.25 * (1 - (y - 5.9) / 1.1))
  return best
}

export function liftOffTreeSurface(point: THREE.Vector3, clearance = 0.16): THREE.Vector3 {
  const out = point.clone()
  const y = THREE.MathUtils.clamp(out.y, 0.65, 6.95)
  out.y = y
  const need = treeRadiusAtY(y) + clearance
  const horiz = Math.hypot(out.x, out.z)
  if (horiz < 1e-4) {
    out.x = need
    out.z = 0
    return out
  }
  if (horiz < need) {
    const s = need / horiz
    out.x *= s
    out.z *= s
  }
  return out
}

export function surfacePath(points: THREE.Vector3[], segmentsPerSpan = 10): THREE.Vector3[] {
  if (points.length === 0) return []
  if (points.length === 1) return [liftOffTreeSurface(points[0]!)]

  const lifted = points.map((p) => liftOffTreeSurface(p, 0.2))
  const result: THREE.Vector3[] = []

  for (let i = 0; i < lifted.length - 1; i++) {
    const a = lifted[i]!
    const b = lifted[i + 1]!
    for (let s = 0; s < segmentsPerSpan; s++) {
      const t = s / segmentsPerSpan
      const ra = Math.hypot(a.x, a.z)
      const rb = Math.hypot(b.x, b.z)
      const angA = Math.atan2(a.z, a.x)
      const angB = Math.atan2(b.z, b.x)
      let dAng = angB - angA
      while (dAng > Math.PI) dAng -= Math.PI * 2
      while (dAng < -Math.PI) dAng += Math.PI * 2
      const ang = angA + dAng * t
      const y = a.y + (b.y - a.y) * t
      const rLerp = ra + (rb - ra) * t
      const r = Math.max(rLerp, treeRadiusAtY(y) + 0.2)
      result.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r))
    }
  }
  result.push(lifted[lifted.length - 1]!.clone())
  return result
}
