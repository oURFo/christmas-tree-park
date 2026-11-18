/**
 * 真實冷杉／雲杉參考：輪生分枝、層間有空隙、下寬上窄
 * y = 輪生高度, r = 外伸半徑, branches = 主枝數
 */
export const TREE_LAYER_DEFS = [
  { y: 1.05, r: 2.4, branches: 9, droop: 0.42, color: 0 },
  { y: 1.95, r: 2.15, branches: 9, droop: 0.38, color: 0 },
  { y: 2.85, r: 1.85, branches: 8, droop: 0.34, color: 1 },
  { y: 3.65, r: 1.55, branches: 8, droop: 0.3, color: 1 },
  { y: 4.35, r: 1.25, branches: 7, droop: 0.26, color: 2 },
  { y: 4.95, r: 0.95, branches: 7, droop: 0.22, color: 3 },
  { y: 5.45, r: 0.68, branches: 6, droop: 0.18, color: 3 },
  { y: 5.9, r: 0.42, branches: 5, droop: 0.12, color: 4 },
] as const
