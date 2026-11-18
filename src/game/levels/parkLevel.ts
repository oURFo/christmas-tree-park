import type { LevelConfig, LevelTitle, TitleWhen } from '../types'

const t = (text: string, ...when: TitleWhen[]): LevelTitle =>
  when.length ? { text, when } : { text }

const memeLow = (titles: LevelTitle[]): LevelConfig['titles'][number] => ({
  min: 0,
  max: 9999,
  tone: 'meme',
  titles,
})
const memeMid = (titles: LevelTitle[]): LevelConfig['titles'][number] => ({
  min: 10000,
  max: 24999,
  tone: 'meme',
  titles,
})
const memeHigh = (titles: LevelTitle[]): LevelConfig['titles'][number] => ({
  min: 25000,
  max: 39999,
  tone: 'meme',
  titles,
})
const normal = (min: number, max: number, titles: LevelTitle[]): LevelConfig['titles'][number] => ({
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
    memeLow([
      t('故事書還沒開頁', { kind: 'maxItems', n: 4 }),
      t('童話精靈路過沒認出', { kind: 'minItems', n: 5 }, { kind: 'maxSceneFit', n: 45 }),
      t('打卡失敗・請重拍', { kind: 'minItems', n: 5 }, { kind: 'maxSpatial', n: 40 }),
      t('就只是一棵樹'),
    ]),
    memeMid([
      t('完全是在浪費電', { kind: 'minPower', w: 500 }, { kind: 'maxWeighted', n: 48 }),
      t('電力公司：謝謝你的業績', { kind: 'minStrings', n: 2 }, { kind: 'maxColor', n: 48 }),
      t('這比較像工地夜景', { kind: 'maxPrefColor', r: 0.45 }, { kind: 'minItems', n: 6 }),
      t('完全是在浪費電'),
    ]),
    memeHigh([
      t('聖誕樹本人很想請假', { kind: 'unevenSpatial' }, { kind: 'minTreeOrnaments', n: 5 }),
      t('公園管理局已報警', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 55 }),
      t('樹：我只是背景板', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 4 }),
      t('聖誕樹本人很想請假'),
    ]),
    normal(25000, 44999, [
      t('社區溫馨小聚點', { kind: 'maxItems', n: 18 }),
      t('街坊開始駐足拍照', { kind: 'minStrings', n: 1 }, { kind: 'minSpatial', n: 45 }),
      t('社區溫馨小聚點'),
    ]),
    normal(45000, 64999, [
      t('童話公園熱門打卡', { kind: 'hasTag', tag: '童話' }),
      t('情侶與親子必訪夜景', { kind: 'minSceneFit', n: 55 }, { kind: 'hasBase' }),
      t('童話公園熱門打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級夢幻童話盛典', { kind: 'minItems', n: 20 }, { kind: 'hasTopper' }),
      t('人潮擠爆公園步道', { kind: 'minDevices', n: 2 }, { kind: 'minStrings', n: 1 }),
      t('城市級夢幻童話盛典'),
    ]),
    normal(85000, 99999, [
      t('傳說級奇蹟聖誕樹', { kind: 'minSceneFit', n: 70 }),
      t('登上頭條的童話奇蹟', { kind: 'minColor', n: 65 }, { kind: 'hasTopper' }),
      t('傳說級奇蹟聖誕樹'),
    ]),
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
    memeLow([
      t('結冰失敗・請回溫', { kind: 'maxPrefColor', r: 0.4 }),
      t('雪精靈：這什麼熱帶風', { kind: 'familyCountAtLeast', n: 4 }),
      t('藍白配額未達標', { kind: 'maxItems', n: 6 }),
      t('結冰失敗・請回溫'),
    ]),
    memeMid([
      t('冰箱門沒關好', { kind: 'hasId', id: 'dev_snow' }, { kind: 'maxSceneFit', n: 50 }),
      t('這比較像開冷氣', { kind: 'minPower', w: 400 }, { kind: 'maxColor', n: 45 }),
      t('融雪預報已發布', { kind: 'missingId', id: 'dev_snow' }, { kind: 'hasTag', tag: '冰雪' }),
      t('這比較像開冷氣'),
    ]),
    memeHigh([
      t('冰晶本人想請假', { kind: 'unevenSpatial' }),
      t('觀測站拒絕承認', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 55 }),
      t('極光：我先走了', { kind: 'maxStrings', n: 0 }),
      t('冰晶本人想請假'),
    ]),
    normal(25000, 44999, [
      t('社區小雪景點', { kind: 'maxItems', n: 18 }),
      t('路人開始拍霧氣', { kind: 'hasId', id: 'dev_snow' }),
      t('社區小雪景點'),
    ]),
    normal(45000, 64999, [
      t('冰晶公園打卡牆', { kind: 'minPrefColor', r: 0.55 }),
      t('冷色控必訪夜景', { kind: 'minColor', n: 55 }, { kind: 'familyCountAtMost', n: 3 }),
      t('冰晶公園打卡牆'),
    ]),
    normal(65000, 84999, [
      t('城市級冰雪鏡面夜', { kind: 'hasId', id: 'dev_snow' }, { kind: 'hasTopper' }),
      t('旅遊雜誌封面候選', { kind: 'minSpatial', n: 60 }, { kind: 'minStrings', n: 1 }),
      t('城市級冰雪鏡面夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級冰晶奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('登上極地影像年鑑', { kind: 'minPrefColor', r: 0.7 }),
      t('傳說級冰晶奇蹟樹'),
    ]),
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
    memeLow([
      t('DJ 還沒到場', { kind: 'missingId', id: 'dev_speaker' }, { kind: 'maxItems', n: 8 }),
      t('霓虹燈壞一半', { kind: 'maxStrings', n: 0 }),
      t('派對被房東趕走', { kind: 'minDevices', n: 1 }, { kind: 'maxDeviceAim', n: 40 }),
      t('DJ 還沒到場'),
    ]),
    memeMid([
      t('完全是在燒電費', { kind: 'minPower', w: 600 }),
      t('鄰居報警第三次', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'maxSceneFit', n: 50 }),
      t('這比較像修車廠', { kind: 'maxPrefColor', r: 0.4 }, { kind: 'familyCountAtLeast', n: 5 }),
      t('完全是在燒電費'),
    ]),
    memeHigh([
      t('樹：我只是背景板', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('保安請離場', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 50 }),
      t('音響已過載', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'minPower', w: 500 }),
      t('樹：我只是背景板'),
    ]),
    normal(25000, 44999, [
      t('社區小型派對場', { kind: 'maxItems', n: 18 }),
      t('路人開始跟著晃', { kind: 'hasId', id: 'dev_speaker' }),
      t('社區小型派對場'),
    ]),
    normal(45000, 64999, [
      t('夜店級公園打卡', { kind: 'hasTag', tag: '派對' }),
      t('週末人潮熱點', { kind: 'minDevices', n: 2 }, { kind: 'minStrings', n: 1 }),
      t('夜店級公園打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級霓虹聖誕夜', { kind: 'minItems', n: 20 }, { kind: 'hasTopper' }),
      t('短影音播放破百萬', { kind: 'minSpatial', n: 55 }, { kind: 'minStrings', n: 2 }),
      t('城市級霓虹聖誕夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級霓虹奇蹟樹', { kind: 'minSceneFit', n: 65 }),
      t('登上跨年直播主視覺', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'minColor', n: 60 }),
      t('傳說級霓虹奇蹟樹'),
    ]),
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
    memeLow([
      t('糖果罐是空的', { kind: 'maxItems', n: 4 }),
      t('小孩看一眼就走', { kind: 'minItems', n: 5 }, { kind: 'maxSceneFit', n: 40 }),
      t('蛀牙警報尚未解除', { kind: 'maxPrefColor', r: 0.4 }),
      t('糖果罐是空的'),
    ]),
    memeMid([
      t('甜度不足・再加糖', { kind: 'maxPrefColor', r: 0.5 }, { kind: 'minItems', n: 8 }),
      t('這比較像藥局燈箱', { kind: 'familyCountAtLeast', n: 5 }),
      t('拐杖糖全歪了', { kind: 'unevenSpatial' }),
      t('甜度不足・再加糖'),
    ]),
    memeHigh([
      t('薑餅人拒絕上工', { kind: 'noBase' }),
      t('糖霜掉漆', { kind: 'maxColor', n: 45 }),
      t('遊行改道了', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 55 }),
      t('薑餅人拒絕上工'),
    ]),
    normal(25000, 44999, [
      t('社區糖果小市集', { kind: 'maxItems', n: 18 }),
      t('親子開始停腳', { kind: 'hasTag', tag: '童趣' }, { kind: 'hasBase' }),
      t('社區糖果小市集'),
    ]),
    normal(45000, 64999, [
      t('糖果鎮熱門打卡', { kind: 'minPrefColor', r: 0.5 }),
      t('幼稚園指定參觀', { kind: 'hasTag', tag: '童話' }, { kind: 'minStrings', n: 1 }),
      t('糖果鎮熱門打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級童話糖霜夜', { kind: 'hasTopper' }, { kind: 'minItems', n: 18 }),
      t('人潮擠爆糖果步道', { kind: 'minDevices', n: 2 }, { kind: 'minSpatial', n: 55 }),
      t('城市級童話糖霜夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級糖果奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('登上童書封面', { kind: 'minColor', n: 65 }, { kind: 'hasTag', tag: '童趣' }),
      t('傳說級糖果奇蹟樹'),
    ]),
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
    memeLow([
      t('雲層百分之百', { kind: 'maxStrings', n: 0 }),
      t('望遠鏡蓋子沒開', { kind: 'maxDevices', n: 0 }),
      t('星象儀當機', { kind: 'maxItems', n: 5 }),
      t('雲層百分之百'),
    ]),
    memeMid([
      t('光害超標', { kind: 'minPower', w: 550 }),
      t('這比較像停車場', { kind: 'maxPrefColor', r: 0.45 }, { kind: 'minDevices', n: 1 }),
      t('北極星找不到', { kind: 'noTopper' }),
      t('光害超標'),
    ]),
    memeHigh([
      t('觀測員想請假', { kind: 'unevenSpatial' }),
      t('流星雨改延期', { kind: 'maxStringNodes', n: 6 }, { kind: 'minStrings', n: 1 }),
      t('衛星訊號干擾', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 55 }),
      t('觀測員想請假'),
    ]),
    normal(25000, 44999, [
      t('社區小小觀星點', { kind: 'maxItems', n: 18 }),
      t('天文社開始駐足', { kind: 'hasTopper' }, { kind: 'minStrings', n: 1 }),
      t('社區小小觀星點'),
    ]),
    normal(45000, 64999, [
      t('觀測台熱門夜景', { kind: 'minSceneFit', n: 55 }),
      t('長曝攝影師聚集', { kind: 'minSpatial', n: 55 }, { kind: 'minDevices', n: 1 }),
      t('觀測台熱門夜景'),
    ]),
    normal(65000, 84999, [
      t('城市級星空聖誕夜', { kind: 'hasTopper' }, { kind: 'minStrings', n: 2 }),
      t('登上天文日曆', { kind: 'minColor', n: 60 }, { kind: 'minPrefColor', r: 0.55 }),
      t('城市級星空聖誕夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級星塵奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('被寫進星圖註記', { kind: 'hasId', id: 'top_star' }),
      t('傳說級星塵奇蹟樹'),
    ]),
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
    memeLow([
      t('鐘還沒敲響', { kind: 'maxStrings', n: 0 }),
      t('唱詩班還沒到', { kind: 'maxItems', n: 5 }),
      t('燭火全滅了', { kind: 'maxDevices', n: 0 }, { kind: 'maxPower', w: 120 }),
      t('鐘還沒敲響'),
    ]),
    memeMid([
      t('管風琴跑調', { kind: 'minStrings', n: 1 }, { kind: 'maxColor', n: 48 }),
      t('這比較像工地彌撒', { kind: 'maxPrefColor', r: 0.5 }, { kind: 'minDevices', n: 1 }),
      t('禮帽戴反了', { kind: 'hasTopper' }, { kind: 'maxSpatial', n: 45 }),
      t('管風琴跑調'),
    ]),
    memeHigh([
      t('天使想加班費', { kind: 'minPower', w: 500 }, { kind: 'maxWeighted', n: 55 }),
      t('鐘樓管理員報警', { kind: 'minDevices', n: 2 }, { kind: 'maxDeviceAim', n: 55 }),
      t('樹：我只是聖壇背景', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('天使想加班費'),
    ]),
    normal(25000, 44999, [
      t('社區溫馨彌撒角', { kind: 'hasBase' }, { kind: 'maxItems', n: 20 }),
      t('街坊開始駐足聽鐘', { kind: 'minStrings', n: 1 }, { kind: 'minSpatial', n: 45 }),
      t('社區溫馨彌撒角'),
    ]),
    normal(45000, 64999, [
      t('教堂廣場熱門夜景', { kind: 'minSceneFit', n: 55 }),
      t('婚禮攝影首選', { kind: 'hasTopper' }, { kind: 'minColor', n: 55 }),
      t('教堂廣場熱門夜景'),
    ]),
    normal(65000, 84999, [
      t('城市級鐘鳴聖誕夜', { kind: 'hasTopper' }, { kind: 'hasBase' }),
      t('人潮擠滿石階', { kind: 'minDevices', n: 2 }, { kind: 'minItems', n: 20 }),
      t('城市級鐘鳴聖誕夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級聖壇奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('登上聖樂節主視覺', { kind: 'minPrefColor', r: 0.65 }, { kind: 'hasTag', tag: '經典' }),
      t('傳說級聖壇奇蹟樹'),
    ]),
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
    memeLow([
      t('誤點兩小時', { kind: 'maxItems', n: 5 }),
      t('月台空無一人', { kind: 'maxDevices', n: 0 }, { kind: 'maxTreeOrnaments', n: 3 }),
      t('行李轉盤卡關', { kind: 'noBase' }),
      t('誤點兩小時'),
    ]),
    memeMid([
      t('廣播只有雜音', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'maxSceneFit', n: 50 }),
      t('這比較像貨運站', { kind: 'maxPrefColor', r: 0.4 }, { kind: 'minDevices', n: 1 }),
      t('雪把軌道蓋住了', { kind: 'hasId', id: 'dev_snow' }, { kind: 'missingId', id: 'base_train' }),
      t('這比較像貨運站'),
    ]),
    memeHigh([
      t('車長想請假', { kind: 'unevenSpatial' }),
      t('列車改停靠別站', { kind: 'missingId', id: 'base_train' }, { kind: 'minItems', n: 10 }),
      t('樹：我只是月台柱', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('車長想請假'),
    ]),
    normal(25000, 44999, [
      t('社區小小終點站', { kind: 'maxItems', n: 18 }),
      t('旅人開始拍照', { kind: 'hasId', id: 'base_train' }),
      t('社區小小終點站'),
    ]),
    normal(45000, 64999, [
      t('雪月台熱門打卡', { kind: 'hasId', id: 'dev_snow' }),
      t('鐵道迷聚集點', { kind: 'hasId', id: 'base_train' }, { kind: 'minStrings', n: 1 }),
      t('雪月台熱門打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級旅路聖誕夜', { kind: 'hasTopper' }, { kind: 'hasId', id: 'base_train' }),
      t('短影音列車主題爆紅', { kind: 'minDevices', n: 2 }, { kind: 'minSpatial', n: 55 }),
      t('城市級旅路聖誕夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級終點奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('登上時刻表封面', { kind: 'hasId', id: 'base_train' }, { kind: 'minColor', n: 60 }),
      t('傳說級終點奇蹟樹'),
    ]),
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
    memeLow([
      t('策展人搖頭', { kind: 'maxSceneFit', n: 40 }),
      t('作品說明是空白', { kind: 'maxItems', n: 4 }),
      t('觀眾請離場', { kind: 'familyCountAtLeast', n: 4 }),
      t('策展人搖頭'),
    ]),
    memeMid([
      t('這比較像倉儲', { kind: 'minItems', n: 22 }),
      t('白牆被彩筆塗鴉', { kind: 'familyCountAtLeast', n: 4 }, { kind: 'maxPrefColor', r: 0.5 }),
      t('導覽耳機沒電', { kind: 'maxStrings', n: 0 }, { kind: 'minItems', n: 8 }),
      t('這比較像倉儲'),
    ]),
    memeHigh([
      t('典藏品拒絕展出', { kind: 'maxPrefColor', r: 0.5 }),
      t('燈光太花被退件', { kind: 'minPower', w: 500 }, { kind: 'familyCountAtLeast', n: 4 }),
      t('樹：我不是裝置藝術嗎', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('典藏品拒絕展出'),
    ]),
    normal(25000, 44999, [
      t('小型白盒展角', { kind: 'maxItems', n: 16 }),
      t('設計系學生駐足', { kind: 'familyCountAtMost', n: 3 }, { kind: 'minColor', n: 50 }),
      t('小型白盒展角'),
    ]),
    normal(45000, 64999, [
      t('美術館熱門打卡', { kind: 'minSceneFit', n: 55 }),
      t('極簡控必訪夜景', { kind: 'maxItems', n: 20 }, { kind: 'familyCountAtMost', n: 3 }),
      t('美術館熱門打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級白盒聖誕展', { kind: 'hasTopper' }, { kind: 'minPrefColor', r: 0.6 }),
      t('登上設計雙年展側記', { kind: 'minSpatial', n: 60 }, { kind: 'minStrings', n: 1 }),
      t('城市級白盒聖誕展'),
    ]),
    normal(85000, 99999, [
      t('傳說級極簡奇蹟樹', { kind: 'minSceneFit', n: 70 }, { kind: 'familyCountAtMost', n: 3 }),
      t('被永久典藏紀念', { kind: 'minColor', n: 70 }),
      t('傳說級極簡奇蹟樹'),
    ]),
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
    memeLow([
      t('請保持安靜', { kind: 'hasId', id: 'dev_speaker' }),
      t('閉館廣播已響起', { kind: 'maxItems', n: 5 }),
      t('借書證過期', { kind: 'maxSceneFit', n: 40 }),
      t('閉館廣播已響起'),
    ]),
    memeMid([
      t('這比較像印刷廠', { kind: 'minItems', n: 22 }),
      t('書頁全被糖霜黏住', { kind: 'maxPrefColor', r: 0.5 }, { kind: 'familyCountAtLeast', n: 4 }),
      t('管理員皺眉三次', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'minPower', w: 300 }),
      t('管理員皺眉三次'),
    ]),
    memeHigh([
      t('禁語區警報', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'minDevices', n: 1 }),
      t('音響被沒收', { kind: 'hasId', id: 'dev_speaker' }, { kind: 'minPower', w: 450 }),
      t('樹：我只是書架背景', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('禁語區警報'),
    ]),
    normal(25000, 44999, [
      t('社區靜讀小角落', { kind: 'maxItems', n: 16 }),
      t('夜讀人開始駐足', { kind: 'missingId', id: 'dev_speaker' }, { kind: 'minStrings', n: 1 }),
      t('社區靜讀小角落'),
    ]),
    normal(45000, 64999, [
      t('圖書館熱門夜景', { kind: 'minSceneFit', n: 55 }),
      t('書香與燈火同框', { kind: 'minColor', n: 55 }, { kind: 'hasTag', tag: '復古' }),
      t('圖書館熱門夜景'),
    ]),
    normal(65000, 84999, [
      t('城市級靜夜聖誕展', { kind: 'hasTopper' }, { kind: 'missingId', id: 'dev_speaker' }),
      t('登上閱讀節主海報', { kind: 'minSpatial', n: 60 }, { kind: 'minPrefColor', r: 0.55 }),
      t('城市級靜夜聖誕展'),
    ]),
    normal(85000, 99999, [
      t('傳說級書香奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('寫進館史紀念冊', { kind: 'minColor', n: 65 }, { kind: 'familyCountAtMost', n: 3 }),
      t('傳說級書香奇蹟樹'),
    ]),
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
    memeLow([
      t('宴會延期', { kind: 'maxItems', n: 5 }),
      t('紅毯還沒鋪好', { kind: 'noBase' }),
      t('侍從找不到皇冠', { kind: 'noTopper' }),
      t('宴會延期'),
    ]),
    memeMid([
      t('這比較像喜宴搭棚', { kind: 'maxPrefColor', r: 0.5 }, { kind: 'minDevices', n: 1 }),
      t('金箔預算超支', { kind: 'minPower', w: 550 }),
      t('禮炮啞火', { kind: 'maxStrings', n: 0 }, { kind: 'minItems', n: 8 }),
      t('這比較像喜宴搭棚'),
    ]),
    memeHigh([
      t('御廚想請假', { kind: 'unevenSpatial' }),
      t('宮廷攝影師拒拍', { kind: 'maxColor', n: 45 }, { kind: 'minItems', n: 10 }),
      t('樹：我只是柱子', { kind: 'minDevices', n: 2 }, { kind: 'maxTreeOrnaments', n: 5 }),
      t('御廚想請假'),
    ]),
    normal(25000, 44999, [
      t('社區小型晚宴角', { kind: 'maxItems', n: 18 }),
      t('賓客開始舉杯', { kind: 'hasBase' }, { kind: 'minStrings', n: 1 }),
      t('社區小型晚宴角'),
    ]),
    normal(45000, 64999, [
      t('皇宮廣場熱門打卡', { kind: 'minPrefColor', r: 0.55 }),
      t('紅金控必訪夜景', { kind: 'minColor', n: 55 }, { kind: 'hasTag', tag: '華麗' }),
      t('皇宮廣場熱門打卡'),
    ]),
    normal(65000, 84999, [
      t('城市級紅金盛宴夜', { kind: 'hasTopper' }, { kind: 'hasBase' }),
      t('人潮擠滿宮階', { kind: 'minDevices', n: 2 }, { kind: 'minItems', n: 22 }),
      t('城市級紅金盛宴夜'),
    ]),
    normal(85000, 99999, [
      t('傳說級皇宮奇蹟樹', { kind: 'minSceneFit', n: 70 }),
      t('登上國宴紀念冊', { kind: 'minPrefColor', r: 0.7 }, { kind: 'minColor', n: 65 }),
      t('傳說級皇宮奇蹟樹'),
    ]),
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
