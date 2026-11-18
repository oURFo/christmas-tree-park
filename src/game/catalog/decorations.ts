import type { DecorDef } from '../types'

export const DECORATIONS: DecorDef[] = [
  // 燈條 6
  { id: 'str_warm', name: '暖白小燈串', category: 'lights', kind: 'string', tags: ['溫馨', '公園', '百搭', '童話'], colorFamily: 'warm', swatch: '#ffe2a8' },
  { id: 'str_party', name: '童話糖果燈', category: 'lights', kind: 'string', tags: ['熱鬧', '童趣', '童話'], colorFamily: 'mixed', swatch: '#ff9bb0' },
  { id: 'str_ice', name: '月光冰霜燈', category: 'lights', kind: 'string', tags: ['冰雪', '夢幻', '童話'], colorFamily: 'cool', swatch: '#d6eaf7' },
  { id: 'str_star', name: '星星LED燈串', category: 'lights', kind: 'string', tags: ['夢幻', '浪漫', '經典', '童話'], colorFamily: 'gold', swatch: '#ffd27a' },
  { id: 'str_candle', name: '燭光復古燈', category: 'lights', kind: 'string', tags: ['復古', '溫馨', '公園', '童話'], colorFamily: 'warm', swatch: '#ffc078' },
  { id: 'str_neon', name: '柔粉童話燈', category: 'lights', kind: 'string', tags: ['浪漫', '夢幻', '童話'], colorFamily: 'pastel', swatch: '#c9a0dc' },

  // 球燈 8
  { id: 'orb_red', name: '金雪花紅球', category: 'baubles', kind: 'ornament', tags: ['經典', '溫馨', '童話'], colorFamily: 'red', swatch: '#c62828' },
  { id: 'orb_gold', name: '香檳金箔球', category: 'baubles', kind: 'ornament', tags: ['華麗', '經典', '童話'], colorFamily: 'gold', swatch: '#e8a84a' },
  { id: 'orb_ice', name: '柔光玻璃球', category: 'baubles', kind: 'ornament', tags: ['冰雪', '夢幻', '童話'], colorFamily: 'cool', swatch: '#d6eaf7' },
  { id: 'orb_candy', name: '粉紅雪花球', category: 'baubles', kind: 'ornament', tags: ['童趣', '溫馨', '童話'], colorFamily: 'red', swatch: '#ff9bb0' },
  { id: 'orb_silver', name: '奶油銀雪球', category: 'baubles', kind: 'ornament', tags: ['冰雪', '溫馨', '童話'], colorFamily: 'silver', swatch: '#eef2f7' },
  { id: 'orb_lantern', name: '暖光燈籠球', category: 'baubles', kind: 'ornament', tags: ['溫馨', '公園', '童話'], colorFamily: 'warm', swatch: '#ffb347' },
  { id: 'orb_green', name: '薄荷金邊球', category: 'baubles', kind: 'ornament', tags: ['經典', '自然', '童話'], colorFamily: 'green', swatch: '#5aad8c' },
  { id: 'orb_galaxy', name: '夜空星塵球', category: 'baubles', kind: 'ornament', tags: ['夢幻', '浪漫', '童話'], colorFamily: 'cool', swatch: '#4a5d8a' },

  // 配飾 10
  { id: 'ch_cane', name: '珊瑚拐杖糖', category: 'charms', kind: 'ornament', tags: ['童趣', '經典', '童話'], colorFamily: 'red', swatch: '#f07167' },
  { id: 'ch_bow', name: '絲絨大蝴蝶結', category: 'charms', kind: 'ornament', tags: ['溫馨', '華麗', '童話'], colorFamily: 'red', swatch: '#c94c4c' },
  { id: 'ch_bell', name: '金色雙鈴鐺', category: 'charms', kind: 'ornament', tags: ['經典', '熱鬧', '童話'], colorFamily: 'gold', swatch: '#ffd27a' },
  { id: 'ch_gingerbread', name: '微笑薑餅人', category: 'charms', kind: 'ornament', tags: ['童趣', '溫馨', '童話'], colorFamily: 'warm', swatch: '#c47a3b' },
  { id: 'ch_sock', name: '小紅襪禮袋', category: 'charms', kind: 'ornament', tags: ['溫馨', '童趣', '童話'], colorFamily: 'red', swatch: '#e85d4c' },
  { id: 'ch_pinecone', name: '原木松果', category: 'charms', kind: 'ornament', tags: ['自然', '公園', '溫馨', '童話'], colorFamily: 'warm', swatch: '#8d6e63' },
  { id: 'ch_holly', name: '冬青漿果掛件', category: 'charms', kind: 'ornament', tags: ['自然', '公園', '經典', '童話'], colorFamily: 'green', swatch: '#3d7a5a' },
  { id: 'ch_drum', name: '迷你小鼓', category: 'charms', kind: 'ornament', tags: ['童趣', '熱鬧', '童話'], colorFamily: 'red', swatch: '#d96b6b' },
  { id: 'ch_snowman', name: '絨毛小雪人', category: 'charms', kind: 'ornament', tags: ['冰雪', '童趣', '公園', '童話'], colorFamily: 'silver', swatch: '#fff6e8' },
  { id: 'ch_deer', name: '森林小鹿木牌', category: 'charms', kind: 'ornament', tags: ['自然', '公園', '復古', '童話'], colorFamily: 'warm', swatch: '#c49a6c' },

  // 樹頂 4
  { id: 'top_star', name: '金色伯利恆星', category: 'toppers', kind: 'topper', tags: ['經典', '百搭', '童話'], colorFamily: 'gold', swatch: '#ffd27a' },
  { id: 'top_snowflake', name: '柔光雪花冠', category: 'toppers', kind: 'topper', tags: ['冰雪', '夢幻', '童話'], colorFamily: 'cool', swatch: '#cfe6f5' },
  { id: 'top_angel', name: '天使光環', category: 'toppers', kind: 'topper', tags: ['溫馨', '華麗', '童話'], colorFamily: 'warm', swatch: '#fff1c1' },
  { id: 'top_bow', name: '巨型緞帶結', category: 'toppers', kind: 'topper', tags: ['浪漫', '童趣', '童話'], colorFamily: 'red', swatch: '#e85d4c' },

  // 樹底 4
  { id: 'base_gift_classic', name: '珊瑚薄荷禮盒', category: 'base', kind: 'base', tags: ['經典', '童趣', '童話'], colorFamily: 'red', swatch: '#e85d4c' },
  { id: 'base_gift_luxury', name: '金白奶油禮盒', category: 'base', kind: 'base', tags: ['華麗', '浪漫', '童話'], colorFamily: 'gold', swatch: '#fff6e8' },
  { id: 'base_skirt', name: '針織樹裙', category: 'base', kind: 'base', tags: ['溫馨', '自然', '童話'], colorFamily: 'red', swatch: '#c94c4c' },
  { id: 'base_train', name: '童話小火車', category: 'base', kind: 'base', tags: ['童趣', '熱鬧', '公園', '童話'], colorFamily: 'mixed', swatch: '#6b8fad' },

  // 大型裝置 8
  { id: 'dev_snow', name: '棉花雲造雪壺', category: 'devices', kind: 'device', tags: ['冰雪', '冬夜', '公園', '童話'], colorFamily: 'cool', swatch: '#e8f2fa', aimable: true },
  { id: 'dev_spot', name: '彎柄童話提燈', category: 'devices', kind: 'device', tags: ['冬夜', '溫馨', '公園', '童話'], colorFamily: 'warm', swatch: '#ffd166', aimable: true },
  { id: 'dev_sign', name: '故事書拱門牌', category: 'devices', kind: 'device', tags: ['熱鬧', '派對', '童話'], colorFamily: 'mixed', swatch: '#ff8fa3', aimable: true },
  { id: 'dev_deer', name: '絨毛小鹿雪橇', category: 'devices', kind: 'device', tags: ['夢幻', '經典', '公園', '童話'], colorFamily: 'gold', swatch: '#e9c46a', aimable: true },
  { id: 'dev_fire', name: '圓石篝火', category: 'devices', kind: 'device', tags: ['溫馨', '公園', '自然', '童話'], colorFamily: 'warm', swatch: '#f77f00', aimable: true },
  { id: 'dev_speaker', name: '童話音樂盒', category: 'devices', kind: 'device', tags: ['熱鬧', '派對', '童話'], colorFamily: 'mixed', swatch: '#9b7edc', aimable: true },
  { id: 'dev_bubble', name: '紫晶泡泡壺', category: 'devices', kind: 'device', tags: ['夢幻', '浪漫', '童趣', '童話'], colorFamily: 'pastel', swatch: '#d4c4ff', aimable: true },
  { id: 'dev_fountain', name: '金粉花精靈泉', category: 'devices', kind: 'device', tags: ['華麗', '熱鬧', '童話'], colorFamily: 'gold', swatch: '#ffd27a', aimable: true },
]

export const CATEGORY_LABELS: Record<string, string> = {
  lights: '燈條',
  baubles: '球燈',
  charms: '配飾',
  toppers: '樹頂',
  base: '樹底',
  devices: '大型裝置',
}

export function getDecor(id: string): DecorDef | undefined {
  return DECORATIONS.find((d) => d.id === id)
}
