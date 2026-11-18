/** 場景視覺主題（每關一套） */
export type SceneTheme = {
  name: string
  sky: number
  fog: number
  hemiSky: number
  hemiGround: number
  sun: number
  fill: number
  treeKey: number
  exposure: number
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  treeLayers: readonly [string, string, string, string, string]
  trunk: string
  stump: string
  ground: string
  path: string
  snow: string
  bench: string
  benchDark: string
  benchLeg: string
  lampPole: string
  lampGlow: string
  crimson: string
  cream: string
  gold: string
  goldDeep: string
  coral: string
  rose: string
  softTeal: string
  softIce: string
  softLilac: string
  softPink: string
  twilight: string
  wood: string
  wire: string
  wireLit: string
  mixed: readonly [string, string, string, string, string]
}

const baseAccents = {
  crimson: '#c62828',
  cream: '#fff5e1',
  gold: '#ffd27a',
  goldDeep: '#e8a84a',
  coral: '#c62828',
  rose: '#e85d4c',
  softTeal: '#2a9d8f',
  softIce: '#d6eaf7',
  softLilac: '#c9a0dc',
  softPink: '#ff9bb0',
  twilight: '#4a5d8a',
  wood: '#8b5e3c',
  wire: '#3a322c',
  wireLit: '#5a4a40',
  mixed: ['#c62828', '#ffd27a', '#2a9d8f', '#9ad4ef', '#ff9bb0'] as const,
}

/** 1 溫馨童話夜 */
export const SCENE_COZY_FAIRY: SceneTheme = {
  name: '溫馨童話夜',
  sky: 0x152238,
  fog: 0x1c2c48,
  hemiSky: 0xffe2c4,
  hemiGround: 0x2a221c,
  sun: 0xffd7a8,
  fill: 0xffc9a0,
  treeKey: 0xffe8d2,
  exposure: 1.08,
  bloomStrength: 0.42,
  bloomRadius: 0.55,
  bloomThreshold: 0.62,
  treeLayers: ['#1a4f38', '#174833', '#14402e', '#123a2a', '#0f3325'],
  trunk: '#5c4638',
  stump: '#4a382c',
  ground: '#e8eef6',
  path: '#9a8b78',
  snow: '#f7fbff',
  bench: '#8b5e3c',
  benchDark: '#6f4a30',
  benchLeg: '#4a3426',
  lampPole: '#2a2a32',
  lampGlow: '#ffe4a8',
  ...baseAccents,
}

/** 2 冰晶藍夜 */
export const SCENE_ICE_BLUE: SceneTheme = {
  name: '冰晶藍夜',
  sky: 0x0b1a2e,
  fog: 0x123048,
  hemiSky: 0xcfe8ff,
  hemiGround: 0x1a2438,
  sun: 0xd8ecff,
  fill: 0xa8c8e8,
  treeKey: 0xe8f4ff,
  exposure: 1.05,
  bloomStrength: 0.48,
  bloomRadius: 0.5,
  bloomThreshold: 0.58,
  treeLayers: ['#1a4a58', '#164350', '#123c48', '#0f3540', '#0c2e38'],
  trunk: '#4a5560',
  stump: '#3a4450',
  ground: '#dce8f2',
  path: '#8a9aaa',
  snow: '#f2f8ff',
  bench: '#6a7a8a',
  benchDark: '#556070',
  benchLeg: '#3a4550',
  lampPole: '#2a3545',
  lampGlow: '#c8e8ff',
  ...baseAccents,
  cream: '#eef6ff',
  gold: '#b8d4f0',
  goldDeep: '#8ab0d8',
  mixed: ['#9ad4ef', '#cfe8ff', '#90caf9', '#e0f7ff', '#b0bec5'],
}

/** 4 派對霓虹夜 */
export const SCENE_PARTY_NEON: SceneTheme = {
  name: '派對霓虹夜',
  sky: 0x1a0a28,
  fog: 0x2a1440,
  hemiSky: 0xffb0e0,
  hemiGround: 0x2a1028,
  sun: 0xff80c8,
  fill: 0xc080ff,
  treeKey: 0xffd0f0,
  exposure: 1.12,
  bloomStrength: 0.55,
  bloomRadius: 0.62,
  bloomThreshold: 0.5,
  treeLayers: ['#2a3860', '#243458', '#1e2e50', '#182848', '#142240'],
  trunk: '#3a2a48',
  stump: '#2a1a38',
  ground: '#2a2038',
  path: '#4a3860',
  snow: '#e8d8f8',
  bench: '#5a3060',
  benchDark: '#482850',
  benchLeg: '#301838',
  lampPole: '#201028',
  lampGlow: '#ff66cc',
  ...baseAccents,
  cream: '#ffe0f4',
  gold: '#ffd27a',
  mixed: ['#ff66cc', '#c77dff', '#4cc9f0', '#ffd60a', '#ff6b6b'],
}

/** 8 童趣糖果鎮 */
export const SCENE_CANDY_TOWN: SceneTheme = {
  name: '童趣糖果鎮',
  sky: 0x2a1840,
  fog: 0x3a2858,
  hemiSky: 0xffd0e8,
  hemiGround: 0x3a2030,
  sun: 0xffc0d8,
  fill: 0xffe0a0,
  treeKey: 0xffe8f0,
  exposure: 1.1,
  bloomStrength: 0.45,
  bloomRadius: 0.55,
  bloomThreshold: 0.58,
  treeLayers: ['#2a6b4a', '#246244', '#1e583c', '#184e34', '#14442c'],
  trunk: '#8a5a40',
  stump: '#6a4430',
  ground: '#fff0f4',
  path: '#e8b8c8',
  snow: '#fff8fb',
  bench: '#e87898',
  benchDark: '#d06080',
  benchLeg: '#a04868',
  lampPole: '#805060',
  lampGlow: '#ffb0d0',
  ...baseAccents,
  cream: '#fff5f8',
  mixed: ['#ff9bb0', '#ffd27a', '#b8e0a8', '#c9a0dc', '#ffc078'],
}

/** 11 星空觀測台 */
export const SCENE_STAR_OBSERVATORY: SceneTheme = {
  name: '星空觀測台',
  sky: 0x050818,
  fog: 0x0c1428,
  hemiSky: 0xa0b8e0,
  hemiGround: 0x101828,
  sun: 0xc0d0f0,
  fill: 0x7080b0,
  treeKey: 0xe0e8ff,
  exposure: 1.02,
  bloomStrength: 0.5,
  bloomRadius: 0.48,
  bloomThreshold: 0.55,
  treeLayers: ['#1a3048', '#162a40', '#122438', '#0e1e30', '#0a1828'],
  trunk: '#3a4050',
  stump: '#2a3040',
  ground: '#1a2438',
  path: '#3a4860',
  snow: '#d8e4f8',
  bench: '#4a5870',
  benchDark: '#3a4860',
  benchLeg: '#2a3848',
  lampPole: '#1a2030',
  lampGlow: '#ffe08a',
  ...baseAccents,
  cream: '#e8eef8',
  gold: '#ffe08a',
  mixed: ['#ffd60a', '#90caf9', '#c9a0dc', '#e0e0e0', '#7eb8ff'],
}

/** 12 教堂鐘鳴夜 */
export const SCENE_CHURCH_BELLS: SceneTheme = {
  name: '教堂鐘鳴夜',
  sky: 0x12182a,
  fog: 0x1c2438,
  hemiSky: 0xffe8c8,
  hemiGround: 0x2a2418,
  sun: 0xffe0b0,
  fill: 0xd8c090,
  treeKey: 0xfff0d8,
  exposure: 1.06,
  bloomStrength: 0.4,
  bloomRadius: 0.5,
  bloomThreshold: 0.6,
  treeLayers: ['#1e4a38', '#1a4432', '#163c2c', '#123426', '#0e2c20'],
  trunk: '#5a4838',
  stump: '#4a3828',
  ground: '#e8e4dc',
  path: '#b0a090',
  snow: '#f4f0e8',
  bench: '#7a6850',
  benchDark: '#625040',
  benchLeg: '#4a3a2a',
  lampPole: '#3a3428',
  lampGlow: '#ffe2a0',
  ...baseAccents,
  cream: '#fff8e8',
  mixed: ['#ffd27a', '#fff1c1', '#e8dcc8', '#c62828', '#d4a84a'],
}

/** 13 車站月台雪 */
export const SCENE_STATION_SNOW: SceneTheme = {
  name: '車站月台雪',
  sky: 0x1a2438,
  fog: 0x243048,
  hemiSky: 0xd0dce8,
  hemiGround: 0x283040,
  sun: 0xe0e8f0,
  fill: 0xb0c0d0,
  treeKey: 0xf0f4f8,
  exposure: 1.06,
  bloomStrength: 0.38,
  bloomRadius: 0.45,
  bloomThreshold: 0.64,
  treeLayers: ['#2a5048', '#244840', '#1e4038', '#183830', '#143028'],
  trunk: '#5a5048',
  stump: '#484038',
  ground: '#e4eaf0',
  path: '#8a9098',
  snow: '#f5f8fb',
  bench: '#6a7078',
  benchDark: '#585e66',
  benchLeg: '#404850',
  lampPole: '#303840',
  lampGlow: '#ffe8b0',
  ...baseAccents,
  cream: '#f0f4f8',
  mixed: ['#90a4ae', '#cfe6f5', '#ffd27a', '#6b8fad', '#e0e0e0'],
}

/** 15 美術館白盒 */
export const SCENE_MUSEUM_WHITE: SceneTheme = {
  name: '美術館白盒',
  sky: 0x2a3038,
  fog: 0x383e48,
  hemiSky: 0xffffff,
  hemiGround: 0xc8c8c8,
  sun: 0xffffff,
  fill: 0xe8e8e8,
  treeKey: 0xffffff,
  exposure: 1.15,
  bloomStrength: 0.28,
  bloomRadius: 0.35,
  bloomThreshold: 0.72,
  treeLayers: ['#3a5a48', '#345442', '#2e4c3c', '#284436', '#223c30'],
  trunk: '#6a6a6a',
  stump: '#585858',
  ground: '#f2f2f2',
  path: '#d0d0d0',
  snow: '#ffffff',
  bench: '#c0c0c0',
  benchDark: '#a8a8a8',
  benchLeg: '#888888',
  lampPole: '#606060',
  lampGlow: '#fff8e0',
  ...baseAccents,
  cream: '#ffffff',
  gold: '#e8d8a8',
  goldDeep: '#c8b888',
  mixed: ['#ffffff', '#e0e0e0', '#ffd27a', '#c0c0c0', '#f5f5f5'],
}

/** 19 圖書館靜夜 */
export const SCENE_LIBRARY_NIGHT: SceneTheme = {
  name: '圖書館靜夜',
  sky: 0x1a1420,
  fog: 0x282030,
  hemiSky: 0xffe0c0,
  hemiGround: 0x2a2018,
  sun: 0xffd8a8,
  fill: 0xc8a878,
  treeKey: 0xffecd0,
  exposure: 1.04,
  bloomStrength: 0.32,
  bloomRadius: 0.4,
  bloomThreshold: 0.68,
  treeLayers: ['#2a4838', '#244032', '#1e382c', '#183026', '#142820'],
  trunk: '#6a5040',
  stump: '#584030',
  ground: '#e8dcc8',
  path: '#a89070',
  snow: '#f4ebe0',
  bench: '#8a6850',
  benchDark: '#705440',
  benchLeg: '#584030',
  lampPole: '#403028',
  lampGlow: '#ffd090',
  ...baseAccents,
  cream: '#fff4e4',
  mixed: ['#ffd27a', '#c49a6c', '#fff1c1', '#8d6e63', '#e8c89a'],
}

/** 23 紅金皇宮宴 */
export const SCENE_PALACE_FEAST: SceneTheme = {
  name: '紅金皇宮宴',
  sky: 0x1a0810,
  fog: 0x2a1018,
  hemiSky: 0xffd0a0,
  hemiGround: 0x3a1818,
  sun: 0xffc070,
  fill: 0xe08060,
  treeKey: 0xffe0b0,
  exposure: 1.1,
  bloomStrength: 0.5,
  bloomRadius: 0.58,
  bloomThreshold: 0.55,
  treeLayers: ['#1a4030', '#163828', '#123020', '#0e2818', '#0a2010'],
  trunk: '#5a3020',
  stump: '#482818',
  ground: '#3a2020',
  path: '#8a6040',
  snow: '#f0e0d0',
  bench: '#8a3028',
  benchDark: '#702018',
  benchLeg: '#501810',
  lampPole: '#3a1810',
  lampGlow: '#ffd27a',
  ...baseAccents,
  cream: '#fff0d8',
  crimson: '#b71c1c',
  mixed: ['#c62828', '#ffd27a', '#e8a84a', '#9b2226', '#fff1c1'],
}

export const SCENE_THEMES: Record<string, SceneTheme> = {
  cozy_fairy: SCENE_COZY_FAIRY,
  ice_blue: SCENE_ICE_BLUE,
  party_neon: SCENE_PARTY_NEON,
  candy_town: SCENE_CANDY_TOWN,
  star_observatory: SCENE_STAR_OBSERVATORY,
  church_bells: SCENE_CHURCH_BELLS,
  station_snow: SCENE_STATION_SNOW,
  museum_white: SCENE_MUSEUM_WHITE,
  library_night: SCENE_LIBRARY_NIGHT,
  palace_feast: SCENE_PALACE_FEAST,
}

/** 目前作用中的場景主題（建世界前由關卡切換） */
export let Theme: SceneTheme = SCENE_COZY_FAIRY

export function setTheme(sceneId: string) {
  Theme = SCENE_THEMES[sceneId] ?? SCENE_COZY_FAIRY
}
