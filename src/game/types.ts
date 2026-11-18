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

/** 稱號觸發條件（同一積分帶內用來分流） */
export type TitleWhen =
  | { kind: 'maxItems'; n: number }
  | { kind: 'minItems'; n: number }
  | { kind: 'maxTreeOrnaments'; n: number }
  | { kind: 'minTreeOrnaments'; n: number }
  | { kind: 'maxStrings'; n: number }
  | { kind: 'minStrings'; n: number }
  | { kind: 'maxStringNodes'; n: number }
  | { kind: 'minStringNodes'; n: number }
  | { kind: 'maxDevices'; n: number }
  | { kind: 'minDevices'; n: number }
  | { kind: 'maxPower'; w: number }
  | { kind: 'minPower'; w: number }
  | { kind: 'maxSceneFit'; n: number }
  | { kind: 'minSceneFit'; n: number }
  | { kind: 'maxColor'; n: number }
  | { kind: 'minColor'; n: number }
  | { kind: 'maxSpatial'; n: number }
  | { kind: 'minSpatial'; n: number }
  | { kind: 'maxDeviceAim'; n: number }
  | { kind: 'minDeviceAim'; n: number }
  | { kind: 'maxPrefColor'; r: number }
  | { kind: 'minPrefColor'; r: number }
  | { kind: 'maxWeighted'; n: number }
  | { kind: 'minWeighted'; n: number }
  | { kind: 'unevenSpatial' }
  | { kind: 'noTopper' }
  | { kind: 'hasTopper' }
  | { kind: 'noBase' }
  | { kind: 'hasBase' }
  | { kind: 'hasId'; id: string }
  | { kind: 'missingId'; id: string }
  | { kind: 'hasTag'; tag: ThemeTag }
  | { kind: 'familyCountAtLeast'; n: number }
  | { kind: 'familyCountAtMost'; n: number }

export interface LevelTitle {
  text: string
  /** 條件全滿足才可出現；越多重條件優先越高。無 when＝該帶保底候選 */
  when?: TitleWhen[]
}

export interface LevelTitleBand {
  min: number
  max: number
  titles: LevelTitle[]
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
