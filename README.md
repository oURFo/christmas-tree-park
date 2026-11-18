# 聖誕樹佈置 · 冬夜公園

Q 版 3D 網頁小遊戲：在公園裡佈置聖誕樹，通電展示後結算人氣分數。  
技術：Vite + TypeScript + Three.js，可部署至 GitHub Pages。

## 本機開發

```bash
npm install
npm run dev
```

## 建置 / 部署

```bash
npm run build
npm run deploy
```

若 GitHub Pages 路徑是 `https://USER.github.io/REPO/`，請把 `vite.config.ts` 的 `base` 改成 `'/REPO/'`。

## 操作

- 單指空白處左右滑：鏡頭水平旋轉（以樹為中心）
- 選飾品後點樹冠：擺放
- 燈條：點節點連線 →「完成」結束並取消選取；「回上一步」撤節點
- 大型裝置：點地面放置，可拖移／旋轉朝向
- 「完成佈置」：鏡頭繞樹展示並通電，結算人氣 0–99999
