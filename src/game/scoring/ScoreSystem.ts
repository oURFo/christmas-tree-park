import { getDecor } from '../catalog/decorations'
import type {
  LevelConfig,
  LevelTitle,
  PlacedDevice,
  PlacedOrnament,
  PlacedString,
  ScoreBreakdown,
  ThemeTag,
  TitleWhen,
} from '../types'

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

/** 稱號判定用現場狀態 */
interface TitleContext {
  itemCount: number
  treeOrnaments: number
  strings: number
  stringNodes: number
  devices: number
  powerDraw: number
  sceneFit: number
  colorHarmony: number
  spatialBalance: number
  deviceAim: number
  preferredColorRatio: number
  weighted: number
  unevenSpatial: boolean
  topperPlaced: boolean
  basePlaced: boolean
  ids: Set<string>
  tags: Set<string>
  familyCount: number
}

function matchWhen(cond: TitleWhen, ctx: TitleContext): boolean {
  switch (cond.kind) {
    case 'maxItems':
      return ctx.itemCount <= cond.n
    case 'minItems':
      return ctx.itemCount >= cond.n
    case 'maxTreeOrnaments':
      return ctx.treeOrnaments <= cond.n
    case 'minTreeOrnaments':
      return ctx.treeOrnaments >= cond.n
    case 'maxStrings':
      return ctx.strings <= cond.n
    case 'minStrings':
      return ctx.strings >= cond.n
    case 'maxStringNodes':
      return ctx.stringNodes <= cond.n
    case 'minStringNodes':
      return ctx.stringNodes >= cond.n
    case 'maxDevices':
      return ctx.devices <= cond.n
    case 'minDevices':
      return ctx.devices >= cond.n
    case 'maxPower':
      return ctx.powerDraw <= cond.w
    case 'minPower':
      return ctx.powerDraw >= cond.w
    case 'maxSceneFit':
      return ctx.sceneFit <= cond.n
    case 'minSceneFit':
      return ctx.sceneFit >= cond.n
    case 'maxColor':
      return ctx.colorHarmony <= cond.n
    case 'minColor':
      return ctx.colorHarmony >= cond.n
    case 'maxSpatial':
      return ctx.spatialBalance <= cond.n
    case 'minSpatial':
      return ctx.spatialBalance >= cond.n
    case 'maxDeviceAim':
      return ctx.deviceAim <= cond.n
    case 'minDeviceAim':
      return ctx.deviceAim >= cond.n
    case 'maxPrefColor':
      return ctx.preferredColorRatio <= cond.r
    case 'minPrefColor':
      return ctx.preferredColorRatio >= cond.r
    case 'maxWeighted':
      return ctx.weighted <= cond.n
    case 'minWeighted':
      return ctx.weighted >= cond.n
    case 'unevenSpatial':
      return ctx.unevenSpatial
    case 'noTopper':
      return !ctx.topperPlaced
    case 'hasTopper':
      return ctx.topperPlaced
    case 'noBase':
      return !ctx.basePlaced
    case 'hasBase':
      return ctx.basePlaced
    case 'hasId':
      return ctx.ids.has(cond.id)
    case 'missingId':
      return !ctx.ids.has(cond.id)
    case 'hasTag':
      return ctx.tags.has(cond.tag)
    case 'familyCountAtLeast':
      return ctx.familyCount >= cond.n
    case 'familyCountAtMost':
      return ctx.familyCount <= cond.n
    default:
      return false
  }
}

function titleMatches(title: LevelTitle, ctx: TitleContext): boolean {
  if (!title.when?.length) return true
  return title.when.every((c) => matchWhen(c, ctx))
}

/**
 * 同積分帶內：先找「條件全過」的稱號；
 * 條件越多越優先；同優先度隨機，避免永遠同一句。
 * 若都沒過，用無條件保底稱號。
 */
function pickTitle(level: LevelConfig, popularity: number, memePreferred: boolean, ctx: TitleContext): string {
  const bands = level.titles.filter((b) => popularity >= b.min && popularity <= b.max)
  const meme = bands.filter((b) => b.tone === 'meme')
  const normal = bands.filter((b) => b.tone === 'normal')
  const pool = (memePreferred && meme.length ? meme : normal.length ? normal : bands).flatMap((b) => b.titles)
  if (!pool.length) return '神秘的童話訪客'

  const matched = pool.filter((title) => title.when?.length && titleMatches(title, ctx))
  const fallbacks = pool.filter((title) => !title.when?.length)
  const candidates = matched.length ? matched : fallbacks.length ? fallbacks : pool

  let bestScore = -1
  const top: LevelTitle[] = []
  for (const title of candidates) {
    const score = title.when?.length ?? 0
    if (score > bestScore) {
      bestScore = score
      top.length = 0
      top.push(title)
    } else if (score === bestScore) {
      top.push(title)
    }
  }
  return top[Math.floor(Math.random() * top.length)]!.text
}

/** 數量門檻：略放寬，中量佈置也能拿到可用分數 */
function quantityGate(n: number): number {
  if (n <= 0) return 0
  if (n < 4) return 0.32
  if (n < 7) return 0.5
  if (n < 10) return 0.66
  if (n < 14) return 0.8
  if (n < 20) return 0.9
  if (n < 26) return 0.96
  return 1
}

/** 評分：貼主題仍重要，但懲罰較溫和 */
export function scoreLayout(
  level: LevelConfig,
  ornaments: PlacedOrnament[],
  strings: PlacedString[],
  devices: PlacedDevice[],
): ScoreBreakdown {
  const allDefs = [
    ...ornaments.map((o) => getDecor(o.defId)),
    ...strings.map((s) => getDecor(s.defId)),
    ...devices.map((d) => getDecor(d.defId)),
  ].filter(Boolean)

  const itemCount = ornaments.length + strings.length + devices.length
  const behaviorTags: string[] = []
  const stringNodeCount = strings.reduce((s, x) => s + x.points.length, 0)
  const treeOrnaments = ornaments.filter((o) => {
    const k = getDecor(o.defId)?.kind
    return k === 'ornament'
  }).length

  if (itemCount === 0) {
    return {
      sceneFit: 0,
      colorHarmony: 0,
      spatialBalance: 0,
      deviceAim: 0,
      richness: 0,
      weighted: 0,
      popularity: 0,
      powerDraw: 0,
      combos: [],
      title: '就只是一棵樹',
      behaviorTags: ['就只是一棵樹'],
    }
  }

  const rules = level.scoreRules ?? {}
  const maxFamilies = rules.maxColorFamilies ?? 5
  const minPrefRatio = rules.minPreferredColorRatio ?? 0.45
  const sceneFitW = rules.sceneFitWeight ?? 1
  const richnessBonus = rules.richnessBonus ?? 1

  // 1) scene fit
  let tagHits = 0
  let tagTotal = 0
  for (const def of allDefs) {
    for (const tag of def!.tags) {
      tagTotal++
      if (level.preferredTags.includes(tag as ThemeTag)) tagHits++
    }
  }
  const tagRatio = tagHits / Math.max(1, tagTotal)
  let sceneFit = clamp(tagRatio * 95)
  if (tagRatio < 0.45) sceneFit = clamp(sceneFit * 0.75)
  if (tagRatio < 0.3) sceneFit = clamp(sceneFit * 0.7)
  if (itemCount < 8) sceneFit = clamp(sceneFit * 0.82)
  if (itemCount > 0) sceneFit = Math.max(sceneFit, 14)
  sceneFit = clamp(sceneFit * sceneFitW)

  // 2) color harmony — 依關卡色系上限／偏好占比
  const colorCounts = new Map<string, number>()
  for (const def of allDefs) {
    colorCounts.set(def!.colorFamily, (colorCounts.get(def!.colorFamily) ?? 0) + 1)
  }
  const families = [...colorCounts.keys()]
  const preferredColorRatio =
    allDefs.filter((d) => level.preferredColors.includes(d!.colorFamily)).length / Math.max(1, allDefs.length)
  let colorHarmony = clamp(preferredColorRatio * 58)
  if (itemCount >= 8 && families.length <= 2) colorHarmony = clamp(colorHarmony + 18)
  else if (itemCount >= 8 && families.length === 3) colorHarmony = clamp(colorHarmony + 10)
  if (families.length > maxFamilies) colorHarmony = clamp(colorHarmony - 8 * (families.length - maxFamilies))
  if (preferredColorRatio < minPrefRatio) colorHarmony = clamp(colorHarmony * 0.82)
  if (itemCount < 6) colorHarmony = clamp(colorHarmony * 0.7)
  // 保底：有放東西就不至於配色完全空白
  if (itemCount > 0) colorHarmony = Math.max(colorHarmony, 14)

  // 3) spatial balance
  const quadrants = [0, 0, 0, 0]
  const bands = [0, 0, 0]
  for (const o of ornaments) {
    const [x, y, z] = o.position
    const q = (x >= 0 ? 0 : 1) + (z >= 0 ? 0 : 2)
    quadrants[q]!++
    if (y < 2.7) bands[0]!++
    else if (y < 4.9) bands[1]!++
    else bands[2]!++
  }
  for (const s of strings) {
    for (const p of s.points) {
      const q = (p[0] >= 0 ? 0 : 1) + (p[2] >= 0 ? 0 : 2)
      quadrants[q]!++
      if (p[1] < 2.7) bands[0]!++
      else if (p[1] < 4.9) bands[1]!++
      else bands[2]!++
    }
  }
  const qMin = Math.min(...quadrants)
  const qMax = Math.max(...quadrants)
  const coverage = quadrants.filter((q) => q > 0).length
  const bandCoverage = bands.filter((b) => b > 0).length
  let spatialBalance = clamp(coverage * 9 + bandCoverage * 9 + (qMax === 0 ? 0 : (qMin / qMax) * 32))
  if (coverage < 3) spatialBalance = clamp(spatialBalance * 0.75)
  if (bandCoverage < 2) spatialBalance = clamp(spatialBalance * 0.78)
  if (treeOrnaments < 4) spatialBalance = clamp(spatialBalance * 0.7)
  if (itemCount > 0) spatialBalance = Math.max(spatialBalance, 12)

  const topperPlaced = allDefs.some((d) => d!.kind === 'topper')
  const basePlaced = allDefs.some((d) => d!.kind === 'base')
  if (!topperPlaced) spatialBalance = clamp(spatialBalance - 7)
  if (!basePlaced) spatialBalance = clamp(spatialBalance - 6)
  if (strings.length === 0) spatialBalance = clamp(spatialBalance - 10)
  if (strings.length > 0) spatialBalance = clamp(spatialBalance + 6)

  // 4) device aim
  let deviceAim = 0
  if (devices.length === 0) {
    deviceAim = 28
  } else {
    let sum = 0
    for (const d of devices) {
      const toTree = new THREELikeVec(-d.position[0], 0, -d.position[2]).normalize()
      const facing = new THREELikeVec(Math.sin(d.yaw), 0, Math.cos(d.yaw))
      const dot = Math.max(0, toTree.dot(facing))
      sum += dot * 100
      if (dot < 0.4) behaviorTags.push('朝向偏差')
    }
    deviceAim = clamp(sum / devices.length)
    if (deviceAim < 50) deviceAim = clamp(deviceAim * 0.8)
    if (devices.length < 2) deviceAim = clamp(deviceAim * 0.88)
  }

  // 5) richness：少放給低分，但避免叠乘到 0
  const unique = new Set(allDefs.map((d) => d!.id)).size
  let richness = clamp(unique * 3.6 + Math.min(itemCount, 28) * 1.35)
  if (itemCount < 10) richness = clamp(richness * 0.7)
  if (itemCount < 6) richness = clamp(richness * 0.78)
  if (unique < 6) richness = clamp(richness * 0.8)
  if (itemCount > 50) richness = clamp(richness - (itemCount - 50) * 2)
  if (stringNodeCount >= 10 && spatialBalance < 35) richness = clamp(richness * 0.8)
  // 簡約關：堆太多反而扣分
  if (rules.preferSparse) {
    const softCap = rules.sparseItemSoftCap ?? 20
    if (itemCount > softCap) richness = clamp(richness - (itemCount - softCap) * 1.6)
    if (families.length <= 2 && itemCount <= softCap) richness = clamp(richness + 12)
  }
  richness = clamp(richness * richnessBonus)
  // 保底：有內容至少給可讀分數
  if (itemCount > 0) richness = Math.max(richness, Math.min(24, 10 + unique * 2 + itemCount))

  if (strings.length === 0) {
    sceneFit = clamp(sceneFit - 4)
    colorHarmony = clamp(colorHarmony - 3)
  }

  let weighted =
    sceneFit * 0.28 + colorHarmony * 0.22 + spatialBalance * 0.26 + deviceAim * 0.14 + richness * 0.1

  weighted = clamp(weighted * quantityGate(itemCount))

  const combos: string[] = []
  let bonus = 0
  const ids = new Set(allDefs.map((d) => d!.id))
  const tagSet = new Set(allDefs.flatMap((d) => d!.tags))

  // combo 門檻略降
  const comboReady = itemCount >= 12 && strings.length >= 1 && coverage >= 3
  if (comboReady && (ids.has('top_star') || ids.has('top_snowflake')) && ids.has('dev_snow')) {
    combos.push('星光與雪夜')
    bonus += 2000
  }
  const natureCount = ['ch_pinecone', 'ch_deer', 'ch_snowman', 'ch_holly'].filter((id) => ids.has(id)).length
  if (comboReady && natureCount >= 3 && (ids.has('dev_fire') || ids.has('dev_spot')) && sceneFit >= 55) {
    combos.push('森林公園童話')
    bonus += 2200
  }
  const spots = devices.filter((d) => d.defId === 'dev_spot')
  if (comboReady && spots.length >= 2 && deviceAim >= 68) {
    combos.push('光影魔術師')
    bonus += 2400
  }
  if (comboReady && coverage === 4 && bandCoverage >= 2 && basePlaced && topperPlaced) {
    combos.push('完美環景打卡點')
    bonus += 2200
  }

  // 略放寬人氣曲線
  let popularity = Math.round(Math.pow(weighted / 100, 1.65) * 62000 + bonus)
  popularity = Math.max(0, Math.min(99999, popularity))

  // 耗費電力（瓦）：燈條／球燈／裝置加總
  const deviceWatts: Record<string, number> = {
    dev_snow: 420,
    dev_spot: 180,
    dev_sign: 95,
    dev_deer: 60,
    dev_fire: 40,
    dev_speaker: 110,
    dev_bubble: 85,
    dev_fountain: 150,
  }
  let powerDraw = 0
  for (const s of strings) {
    const nodes = Math.max(2, s.points.length)
    powerDraw += 25 + nodes * 9
  }
  for (const o of ornaments) {
    const def = getDecor(o.defId)
    if (!def) continue
    if (def.kind === 'topper') powerDraw += 35
    else if (def.category === 'baubles') powerDraw += 8
    else if (def.kind === 'base') {
      if (def.id === 'base_train') powerDraw += 55
      else powerDraw += 4
    } else powerDraw += 3
  }
  for (const d of devices) {
    powerDraw += deviceWatts[d.defId] ?? 70
  }
  powerDraw = Math.round(powerDraw)

  const unevenSpatial = qMax > 0 && qMin / qMax < 0.35
  if (itemCount <= 3) behaviorTags.push('就只是一棵樹')
  if ((itemCount >= 8 || stringNodeCount >= 8) && weighted < 40) behaviorTags.push('完全是在浪費電')
  if (unevenSpatial && itemCount >= 5) behaviorTags.push('聖誕樹本人很想請假')
  if (devices.length >= 2 && deviceAim < 55) behaviorTags.push('公園管理局已報警')
  if (preferredColorRatio < 0.45 && itemCount >= 6) behaviorTags.push('這比較像工地夜景')
  if (devices.length >= 2 && treeOrnaments + strings.length <= 4) behaviorTags.push('樹：我只是背景板')
  if (tagSet.has('派對') && sceneFit < 55) behaviorTags.push('聖誕老人路過沒認出')
  if (strings.length >= 2 && colorHarmony < 45) behaviorTags.push('電力公司：謝謝你的業績')
  if (powerDraw >= 900 && weighted < 55) behaviorTags.push('完全是在浪費電')

  const memePreferred = behaviorTags.length > 0 && (popularity < 45000 || weighted < 50)

  const titleCtx: TitleContext = {
    itemCount,
    treeOrnaments,
    strings: strings.length,
    stringNodes: stringNodeCount,
    devices: devices.length,
    powerDraw,
    sceneFit,
    colorHarmony,
    spatialBalance,
    deviceAim,
    preferredColorRatio,
    weighted,
    unevenSpatial,
    topperPlaced,
    basePlaced,
    ids,
    tags: tagSet,
    familyCount: families.length,
  }
  const title = pickTitle(level, popularity, memePreferred, titleCtx)

  return {
    sceneFit: Math.round(sceneFit),
    colorHarmony: Math.round(colorHarmony),
    spatialBalance: Math.round(spatialBalance),
    deviceAim: Math.round(deviceAim),
    richness: Math.round(richness),
    weighted: Math.round(weighted),
    popularity,
    powerDraw,
    combos,
    title,
    behaviorTags,
  }
}

class THREELikeVec {
  x: number
  y: number
  z: number
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
  normalize() {
    const l = Math.hypot(this.x, this.y, this.z) || 1
    this.x /= l
    this.y /= l
    this.z /= l
    return this
  }
  dot(o: THREELikeVec) {
    return this.x * o.x + this.y * o.y + this.z * o.z
  }
}
