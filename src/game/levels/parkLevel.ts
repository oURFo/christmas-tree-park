import type { LevelConfig } from '../types'

const memeLow = (titles: string[]): LevelConfig['titles'][number] => ({
  min: 0,
  max: 9999,
  tone: 'meme',
  titles,
})
const memeMid = (titles: string[]): LevelConfig['titles'][number] => ({
  min: 10000,
  max: 24999,
  tone: 'meme',
  titles,
})
const memeHigh = (titles: string[]): LevelConfig['titles'][number] => ({
  min: 25000,
  max: 39999,
  tone: 'meme',
  titles,
})
const normal = (min: number, max: number, titles: string[]): LevelConfig['titles'][number] => ({
  min,
  max,
  tone: 'normal',
  titles,
})

/** 1 溫馨童話夜 */
export const LEVEL_COZY_FAIRY: LevelConfig = {
  id: 'park_cozy_fairy',
  name: '溫馨童話夜',
  sceneId: 'cozy_fairy',
  weight: 1,
  blurb: '奶油紅金公園夜景，溫馨童話基準關。',
  primaryPalette: ['#ffd27a', '#e85d4c', '#5aad8c', '#fff6e8'],
  preferredTags: ['童話', '溫馨', '公園', '自然', '童趣', '經典'],
  preferredColors: ['warm', 'red', 'gold', 'green', 'pastel'],
  scoreRules: {
    maxColorFamilies: 5,
    minPreferredColorRatio: 0.42,
  },
  titles: [
    memeLow(['故事書還沒開頁', '童話精靈路過沒認出', '打卡失敗・請重拍']),
    memeMid(['完全是在浪費電', '電力公司：謝謝你的業績', '這比較像工地夜景']),
    memeHigh(['聖誕樹本人很想請假', '公園管理局已報警', '樹：我只是背景板']),
    normal(25000, 44999, ['社區溫馨小聚點', '街坊開始駐足拍照']),
    normal(45000, 64999, ['童話公園熱門打卡', '情侶與親子必訪夜景']),
    normal(65000, 84999, ['城市級夢幻童話盛典', '人潮擠爆公園步道']),
    normal(85000, 99999, ['傳說級奇蹟聖誕樹', '登上頭條的童話奇蹟']),
  ],
}

/** 2 冰晶藍夜 */
export const LEVEL_ICE_BLUE: LevelConfig = {
  id: 'park_ice_blue',
  name: '冰晶藍夜',
  sceneId: 'ice_blue',
  weight: 1,
  blurb: '冷色雪光與玻璃感，偏好冰雪銀藍。',
  primaryPalette: ['#9ad4ef', '#cfe8ff', '#d9e2ec', '#90caf9'],
  preferredTags: ['冰雪', '冬夜', '夢幻', '簡約'],
  preferredColors: ['cool', 'silver'],
  scoreRules: {
    maxColorFamilies: 3,
    minPreferredColorRatio: 0.55,
    sceneFitWeight: 1.1,
  },
  titles: [
    memeLow(['結冰失敗・請回溫', '雪精靈：這什麼熱帶風', '藍白配額未達標']),
    memeMid(['冰箱門沒關好', '這比較像開冷氣', '融雪預報已發布']),
    memeHigh(['冰晶本人想請假', '觀測站拒絕承認', '極光：我先走了']),
    normal(25000, 44999, ['社區小雪景點', '路人開始拍霧氣']),
    normal(45000, 64999, ['冰晶公園打卡牆', '冷色控必訪夜景']),
    normal(65000, 84999, ['城市級冰雪鏡面夜', '旅遊雜誌封面候選']),
    normal(85000, 99999, ['傳說級冰晶奇蹟樹', '登上極地影像年鑑']),
  ],
}

/** 4 派對霓虹夜 */
export const LEVEL_PARTY_NEON: LevelConfig = {
  id: 'park_party_neon',
  name: '派對霓虹夜',
  sceneId: 'party_neon',
  weight: 1,
  blurb: '粉紫霓虹派對，熱鬧但不亂色最好。',
  primaryPalette: ['#ff66cc', '#c77dff', '#4cc9f0', '#ffd60a'],
  preferredTags: ['派對', '熱鬧', '現代', '夢幻'],
  preferredColors: ['mixed', 'pastel'],
  scoreRules: {
    maxColorFamilies: 6,
    minPreferredColorRatio: 0.4,
    richnessBonus: 1.15,
  },
  titles: [
    memeLow(['DJ 還沒到場', '霓虹燈壞一半', '派對被房東趕走']),
    memeMid(['完全是在燒電費', '鄰居報警第三次', '這比較像修車廠']),
    memeHigh(['樹：我只是背景板', '保安請離場', '音響已過載']),
    normal(25000, 44999, ['社區小型派對場', '路人開始跟著晃']),
    normal(45000, 64999, ['夜店級公園打卡', '週末人潮熱點']),
    normal(65000, 84999, ['城市級霓虹聖誕夜', '短影音播放破百萬']),
    normal(85000, 99999, ['傳說級霓虹奇蹟樹', '登上跨年直播主視覺']),
  ],
}

/** 8 童趣糖果鎮 */
export const LEVEL_CANDY_TOWN: LevelConfig = {
  id: 'park_candy_town',
  name: '童趣糖果鎮',
  sceneId: 'candy_town',
  weight: 1,
  blurb: '粉紅糖果與拐杖糖，童趣優先。',
  primaryPalette: ['#ff9bb0', '#ffd27a', '#fff5f8', '#c9a0dc'],
  preferredTags: ['童趣', '童話', '熱鬧', '溫馨'],
  preferredColors: ['pastel', 'red', 'warm'],
  scoreRules: {
    maxColorFamilies: 4,
    minPreferredColorRatio: 0.5,
    richnessBonus: 1.08,
  },
  titles: [
    memeLow(['糖果罐是空的', '小孩看一眼就走', '蛀牙警報尚未解除']),
    memeMid(['甜度不足・再加糖', '這比較像藥局燈箱', '拐杖糖全歪了']),
    memeHigh(['薑餅人拒絕上工', '糖霜掉漆', '遊行改道了']),
    normal(25000, 44999, ['社區糖果小市集', '親子開始停腳']),
    normal(45000, 64999, ['糖果鎮熱門打卡', '幼稚園指定參觀']),
    normal(65000, 84999, ['城市級童話糖霜夜', '人潮擠爆糖果步道']),
    normal(85000, 99999, ['傳說級糖果奇蹟樹', '登上童書封面']),
  ],
}

/** 11 星空觀測台 */
export const LEVEL_STAR_OBSERVATORY: LevelConfig = {
  id: 'park_star_observatory',
  name: '星空觀測台',
  sceneId: 'star_observatory',
  weight: 1,
  blurb: '深藍星塵，銀河與星燈串加分。',
  primaryPalette: ['#0b1a33', '#ffd60a', '#90caf9', '#e0e0e0'],
  preferredTags: ['夢幻', '冬夜', '現代', '浪漫'],
  preferredColors: ['cool', 'silver', 'gold'],
  scoreRules: {
    maxColorFamilies: 4,
    minPreferredColorRatio: 0.5,
    sceneFitWeight: 1.12,
  },
  titles: [
    memeLow(['雲層百分之百', '望遠鏡蓋子沒開', '星象儀當機']),
    memeMid(['光害超標', '這比較像停車場', '北極星找不到']),
    memeHigh(['觀測員想請假', '流星雨改延期', '衛星訊號干擾']),
    normal(25000, 44999, ['社區小小觀星點', '天文社開始駐足']),
    normal(45000, 64999, ['觀測台熱門夜景', '長曝攝影師聚集']),
    normal(65000, 84999, ['城市級星空聖誕夜', '登上天文日曆']),
    normal(85000, 99999, ['傳說級星塵奇蹟樹', '被寫進星圖註記']),
  ],
}

/** 12 教堂鐘鳴夜 */
export const LEVEL_CHURCH_BELLS: LevelConfig = {
  id: 'park_church_bells',
  name: '教堂鐘鳴夜',
  sceneId: 'church_bells',
  weight: 1,
  blurb: '莊重金白暖光，經典與復古為主。',
  primaryPalette: ['#ffd27a', '#fff1c1', '#fff8e8', '#c62828'],
  preferredTags: ['經典', '溫馨', '復古', '華麗'],
  preferredColors: ['gold', 'warm', 'red'],
  scoreRules: {
    maxColorFamilies: 4,
    minPreferredColorRatio: 0.55,
  },
  titles: [
    memeLow(['鐘還沒敲響', '唱詩班還沒到', '燭火全滅了']),
    memeMid(['管風琴跑調', '這比較像工地彌撒', '禮帽戴反了']),
    memeHigh(['天使想加班費', '鐘樓管理員報警', '樹：我只是聖壇背景']),
    normal(25000, 44999, ['社區溫馨彌撒角', '街坊開始駐足聽鐘']),
    normal(45000, 64999, ['教堂廣場熱門夜景', '婚禮攝影首選']),
    normal(65000, 84999, ['城市級鐘鳴聖誕夜', '人潮擠滿石階']),
    normal(85000, 99999, ['傳說級聖壇奇蹟樹', '登上聖樂節主視覺']),
  ],
}

/** 13 車站月台雪 */
export const LEVEL_STATION_SNOW: LevelConfig = {
  id: 'park_station_snow',
  name: '車站月台雪',
  sceneId: 'station_snow',
  weight: 1,
  blurb: '旅途藍白雪景，小火車很加分。',
  primaryPalette: ['#90a4ae', '#cfe6f5', '#ffd27a', '#e8eef4'],
  preferredTags: ['冬夜', '冰雪', '百搭', '童趣'],
  preferredColors: ['cool', 'silver', 'mixed', 'warm'],
  scoreRules: {
    maxColorFamilies: 5,
    minPreferredColorRatio: 0.4,
    richnessBonus: 1.05,
  },
  titles: [
    memeLow(['誤點兩小時', '月台空無一人', '行李轉盤卡關']),
    memeMid(['廣播只有雜音', '這比較像貨運站', '雪把軌道蓋住了']),
    memeHigh(['車長想請假', '列車改停靠別站', '樹：我只是月台柱']),
    normal(25000, 44999, ['社區小小終點站', '旅人開始拍照']),
    normal(45000, 64999, ['雪月台熱門打卡', '鐵道迷聚集點']),
    normal(65000, 84999, ['城市級旅路聖誕夜', '短影音列車主題爆紅']),
    normal(85000, 99999, ['傳說級終點奇蹟樹', '登上時刻表封面']),
  ],
}

/** 15 美術館白盒 */
export const LEVEL_MUSEUM_WHITE: LevelConfig = {
  id: 'park_museum_white',
  name: '美術館白盒',
  sceneId: 'museum_white',
  weight: 1,
  blurb: '極簡白銀展場，少即是多。',
  primaryPalette: ['#ffffff', '#e0e0e0', '#ffd27a', '#c0c0c0'],
  preferredTags: ['簡約', '現代', '華麗'],
  preferredColors: ['silver', 'gold', 'cool'],
  scoreRules: {
    maxColorFamilies: 3,
    minPreferredColorRatio: 0.6,
    preferSparse: true,
    sparseItemSoftCap: 18,
    sceneFitWeight: 1.15,
  },
  titles: [
    memeLow(['策展人搖頭', '作品說明是空白', '觀眾請離場']),
    memeMid(['這比較像倉儲', '白牆被彩筆塗鴉', '導覽耳機沒電']),
    memeHigh(['典藏品拒絕展出', '燈光太花被退件', '樹：我不是裝置藝術嗎']),
    normal(25000, 44999, ['小型白盒展角', '設計系學生駐足']),
    normal(45000, 64999, ['美術館熱門打卡', '極簡控必訪夜景']),
    normal(65000, 84999, ['城市級白盒聖誕展', '登上設計雙年展側記']),
    normal(85000, 99999, ['傳說級極簡奇蹟樹', '被永久典藏紀念']),
  ],
}

/** 19 圖書館靜夜 */
export const LEVEL_LIBRARY_NIGHT: LevelConfig = {
  id: 'park_library_night',
  name: '圖書館靜夜',
  sceneId: 'library_night',
  weight: 1,
  blurb: '安靜紙香金光，忌太吵裝置。',
  primaryPalette: ['#ffd27a', '#c49a6c', '#fff4e4', '#8d6e63'],
  preferredTags: ['簡約', '復古', '經典', '溫馨'],
  preferredColors: ['gold', 'warm'],
  scoreRules: {
    maxColorFamilies: 3,
    minPreferredColorRatio: 0.55,
    preferSparse: true,
    sparseItemSoftCap: 20,
  },
  titles: [
    memeLow(['請保持安靜', '閉館廣播已響起', '借書證過期']),
    memeMid(['這比較像印刷廠', '書頁全被糖霜黏住', '管理員皺眉三次']),
    memeHigh(['禁語區警報', '音響被沒收', '樹：我只是書架背景']),
    normal(25000, 44999, ['社區靜讀小角落', '夜讀人開始駐足']),
    normal(45000, 64999, ['圖書館熱門夜景', '書香與燈火同框']),
    normal(65000, 84999, ['城市級靜夜聖誕展', '登上閱讀節主海報']),
    normal(85000, 99999, ['傳說級書香奇蹟樹', '寫進館史紀念冊']),
  ],
}

/** 23 紅金皇宮宴 */
export const LEVEL_PALACE_FEAST: LevelConfig = {
  id: 'park_palace_feast',
  name: '紅金皇宮宴',
  sceneId: 'palace_feast',
  weight: 1,
  blurb: '宮廷華麗紅金，要滿、要金紅。',
  primaryPalette: ['#c62828', '#ffd27a', '#9b2226', '#fff1c1'],
  preferredTags: ['華麗', '經典', '熱鬧', '浪漫'],
  preferredColors: ['red', 'gold'],
  scoreRules: {
    maxColorFamilies: 4,
    minPreferredColorRatio: 0.6,
    richnessBonus: 1.2,
    sceneFitWeight: 1.08,
  },
  titles: [
    memeLow(['宴會延期', '紅毯還沒鋪好', '侍從找不到皇冠']),
    memeMid(['這比較像喜宴搭棚', '金箔預算超支', '禮炮啞火']),
    memeHigh(['御廚想請假', '宮廷攝影師拒拍', '樹：我只是柱子']),
    normal(25000, 44999, ['社區小型晚宴角', '賓客開始舉杯']),
    normal(45000, 64999, ['皇宮廣場熱門打卡', '紅金控必訪夜景']),
    normal(65000, 84999, ['城市級紅金盛宴夜', '人潮擠滿宮階']),
    normal(85000, 99999, ['傳說級皇宮奇蹟樹', '登上國宴紀念冊']),
  ],
}

export const LEVEL_REGISTRY: LevelConfig[] = [
  LEVEL_COZY_FAIRY,
  LEVEL_ICE_BLUE,
  LEVEL_PARTY_NEON,
  LEVEL_CANDY_TOWN,
  LEVEL_STAR_OBSERVATORY,
  LEVEL_CHURCH_BELLS,
  LEVEL_STATION_SNOW,
  LEVEL_MUSEUM_WHITE,
  LEVEL_LIBRARY_NIGHT,
  LEVEL_PALACE_FEAST,
]

export const PARK_LEVEL = LEVEL_COZY_FAIRY

export function pickLevel(): LevelConfig {
  const total = LEVEL_REGISTRY.reduce((s, l) => s + l.weight, 0)
  let r = Math.random() * total
  for (const level of LEVEL_REGISTRY) {
    r -= level.weight
    if (r <= 0) return level
  }
  return LEVEL_REGISTRY[0]!
}

export function getLevel(id: string): LevelConfig | undefined {
  return LEVEL_REGISTRY.find((l) => l.id === id)
}
