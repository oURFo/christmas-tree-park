export type DecorCategory = 'lights' | 'baubles' | 'charms' | 'toppers' | 'base' | 'devices'

export type ThemeTag =
  | '溫馨'
  | '公園'
  | '百搭'
  | '熱鬧'
  | '童趣'
  | '派對'
  | '冰雪'
  | '冬夜'
  | '夢幻'
  | '浪漫'
  | '經典'
  | '復古'
  | '華麗'
  | '簡約'
  | '自然'
  | '現代'
  | '童話'

export type ColorFamily = 'warm' | 'cool' | 'red' | 'gold' | 'green' | 'silver' | 'mixed' | 'pastel'

export interface DecorDef {
  id: string
  name: string
  category: DecorCategory
  tags: ThemeTag[]
  colorFamily: ColorFamily
  swatch: string
  kind: 'ornament' | 'string' | 'topper' | 'base' | 'device'
  /** device only: can aim */
  aimable?: boolean
}

export interface LevelTitleBand {
  min: number
  max: number
  titles: string[]
  tone: 'normal' | 'meme'
}

/** 關卡專屬評分規則（可選，沒填用預設嚴苛曲線） */
export interface LevelScoreRules {
  /** 色系種類超過此數開始扣分（預設 5） */
  maxColorFamilies?: number
  /** 偏好色占比低於此時懲罰（預設 0.45） */
  minPreferredColorRatio?: number
  /** 簡約關：件數過多扣豐富度 */
  preferSparse?: boolean
  /** 件數超過此值開始扣分（配合 preferSparse，預設 22） */
  sparseItemSoftCap?: number
  /** 派對／華麗關：豐富度加成倍率（預設 1） */
  richnessBonus?: number
  /** 場景貼合權重微調（預設 1） */
  sceneFitWeight?: number
}

export interface LevelConfig {
  id: string
  name: string
  /** 對應 SCENE_THEMES 的 key */
  sceneId: string
  weight: number
  primaryPalette: string[]
  preferredTags: ThemeTag[]
  preferredColors: ColorFamily[]
  titles: LevelTitleBand[]
  /** 關卡評分標準 */
  scoreRules?: LevelScoreRules
  /** 關卡簡介（選關／說明用） */
  blurb?: string
}

export type GamePhase = 'intro' | 'decorate' | 'showcase' | 'result'

export interface PlacedOrnament {
  id: string
  defId: string
  position: [number, number, number]
  normal?: [number, number, number]
  /** 樹頂／樹底可縮放 */
  scale?: number
}

export interface PlacedString {
  id: string
  defId: string
  points: [number, number, number][]
}

export interface PlacedDevice {
  id: string
  defId: string
  position: [number, number, number]
  yaw: number
}

export interface ScoreBreakdown {
  sceneFit: number
  colorHarmony: number
  spatialBalance: number
  deviceAim: number
  richness: number
  weighted: number
  popularity: number
  /** 佈置耗電（瓦） */
  powerDraw: number
  combos: string[]
  title: string
  behaviorTags: string[]
}
