# Line 貼圖全能工具箱
## Product & Engineering Specification

- Version: 2.0.0
- Last Updated: 2026-04-22
- Product Stage: Active refactor / architecture upgrade
- Workspace Layout:
  - Product docs live at `/Users/marcus/Downloads/Line_sticker_maker`
  - Frontend app lives at `/Users/marcus/Downloads/Line_sticker_maker/vitejs-vite`

## 1. Vision
Line 貼圖全能工具箱是一個以創作者工作流為核心的前端應用，提供從靈感企劃、貼圖生成、切圖、尺寸轉換到語意去背的一站式流程。新版本目標不是只把功能做出來，而是把產品升級成可持續演進、可擴充、可驗證、可交接的高品質專案。

## 2. Product Goals
- 降低非技術創作者製作 LINE 貼圖的操作門檻。
- 讓量產工作流可以在單一工具中完成，減少手動切圖與轉檔。
- 保留純前端體驗的速度與隱私優勢，同時提高可維護性與穩定性。
- 為未來增加模板、任務隊列、批次命名、浮水印、預設風格包與協作流程預留架構空間。

## 3. Non-Goals
- 本階段不建立完整後端資料庫系統。
- 本階段不做使用者帳號、支付、雲端儲存。
- 本階段不承諾所有 AI 結果可完全 deterministic；重點是提高流程穩定度、回饋品質與可控性。

## 4. Primary Users
- 個人創作者：需要快速把角色圖轉成一組可上架貼圖。
- 小型工作室：需要批量處理、尺寸規格化與加速修圖流程。
- 企劃與行銷團隊：需要先用文案企劃與風格探索快速做出方向。

## 5. Core User Flows
### 5.1 貼圖生成
1. 上傳角色參考圖。
2. 輸入主題，使用 AI 生成 4 句貼圖文案與建議風格。
3. 調整文字與風格描述。
4. 生成 2x2 四宮格貼圖。
5. 切圖、智能裁切、輸出標準 LINE sticker PNG。
6. 單張下載或批次 ZIP 下載。

### 5.2 尺寸轉換
1. 上傳已完成貼圖。
2. 勾選輸出尺寸。
3. 產出 Main 與 Tab 尺寸圖檔。

### 5.3 語意去背
1. 批次上傳圖片。
2. 選擇保留模式。
3. 由 Gemini 先做語意重繪與元素提取。
4. 前端進行綠幕去背與邊緣處理。
5. 預覽結果、單張下載、批次 ZIP 下載。

## 6. Product Modules
### 6.1 Generator
- Theme-driven 文案企劃。
- Character reference + prompt image generation。
- 四宮格切圖。
- LINE 貼圖安全邊界裁切。
- 續生成同風格變體。

### 6.2 Resizer
- Main 240x240 等比例縮放。
- Tab 96x74 變形輸出。
- 後續可擴充更多 LINE 官方尺寸模板。

### 6.3 Background Remover
- 單批最高 30 張。
- `ai_character`、`ai_text`、`ai_props`、`ai_all`、`classic` 五種模式。
- 本地綠幕去背與邊緣羽化。

## 7. Functional Requirements
### 7.1 Shared
- 所有檔案處理流程需在瀏覽器端完成。
- 介面需在桌面與手機可用。
- 長任務流程需顯示進行中狀態。
- 所有下載檔名需可讀且可安全落盤。

### 7.2 Generator
- 未上傳參考圖時不可觸發生成。
- 支援中止進行中的 AI 生成請求。
- 若 AI 文案回傳非 JSON，需給出可理解錯誤訊息。
- 若生成結果不是可用圖片，需留在可重試狀態。

### 7.3 Resizer
- 支援單圖快速轉換。
- 保證輸出透明背景 PNG。

### 7.4 Background Remover
- 超過批次上限需明確提示。
- 單張失敗不可中止整批成功項目的處理。
- 完成後需可個別下載或打包下載。

## 8. Non-Functional Requirements
### 8.1 Maintainability
- UI、狀態、網路請求、Canvas 演算法、下載邏輯必須分層。
- 不接受單一巨型 `App.jsx` 持續膨脹。
- 新增功能時，預期只需修改 feature 與 shared lib，不應廣泛破壞其他模組。

### 8.2 Reliability
- `npm run lint` 與 `npm run build` 必須通過。
- 環境變數缺失時需有明確提示，不可靜默失敗。
- 批次處理需避免不必要的記憶體保留與 URL 泄漏。

### 8.3 Performance
- 優先保持快速 HMR 與可接受的初始載入大小。
- 壓縮與打包工具應透過正式依賴管理，不使用 runtime CDN 注入核心函式庫。
- 大量圖片處理時應以可控隊列或逐張處理為主，避免爆量併發。

### 8.4 Privacy & Security
- 不在原始碼中硬編碼 Gemini API key。
- 本地 `.env` 不得提交到版本控制。
- 若未來對外公開營運，應評估導入 proxy 層以保護金鑰與用量。

## 9. Architecture Principles
- Feature-first folder layout.
- Shared libraries for Gemini, Canvas, files, and downloads.
- Stateless presentational components as much as practical.
- Hooks own workflow state and side effects.
- Product docs and engineering backlog remain versioned with the repo.

## 10. Target Frontend Architecture
```text
vitejs-vite/
├─ public/
├─ src/
│  ├─ app/
│  │  └─ AppShell.jsx
│  ├─ features/
│  │  ├─ generator/
│  │  │  ├─ GeneratorPanel.jsx
│  │  │  └─ useStickerGenerator.js
│  │  ├─ resizer/
│  │  │  ├─ ResizerPanel.jsx
│  │  │  └─ useStickerResizer.js
│  │  └─ bg-remover/
│  │     ├─ BgRemoverPanel.jsx
│  │     └─ useBgRemover.js
│  ├─ lib/
│  │  ├─ config/
│  │  ├─ constants/
│  │  ├─ download/
│  │  ├─ files/
│  │  ├─ gemini/
│  │  └─ image/
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ .env.example
├─ package.json
└─ README.md
```

## 11. Data & State Design
### 11.1 Generator State
- source image data URL
- source filename
- style input
- text list
- theme input
- generation loading/error state
- generated grid
- split sticker results

### 11.2 Resizer State
- image data URL
- filename
- output toggles

### 11.3 Background Remover State
- selected file items
- mode
- processing state
- per-item result / error / progress status

## 12. External Integrations
### 12.1 Gemini Text Planning
- Model: `gemini-2.5-flash`
- Input: theme prompt
- Output: strict JSON with `style` and `texts`

### 12.2 Gemini Image Generation / Semantic Extraction
- Model family currently targeted: `gemini-3.1-flash-image-preview`
- Generator flow: reference image + strong grid prompt
- Background remover flow: reference image + semantic redraw prompt onto green screen

### 12.3 Configuration
- Required env key:
  - `VITE_GEMINI_API_KEY`

## 13. Design System Direction
- Primary brand tone: LINE-inspired green with clean productivity UI.
- Secondary tone: purple highlight for AI-assisted capabilities.
- Visual goal: professional tool interface, not landing-page decoration.
- Layout goal: predictable control pane + result pane workflow.

## 14. Quality Gates
- Lint passes with zero errors.
- Build succeeds in clean install.
- No hardcoded secrets in source files.
- README, SPEC, and Tasks stay aligned with actual implementation.

## 15. Delivery Strategy
### Phase 1
- Extract code into modules.
- Remove secret from source.
- Replace CDN-based JSZip and Tailwind setup with managed dependencies.
- Restore passing lint/build.

### Phase 2
- Improve error handling and progress UX.
- Add resumable / cancelable batch flows.
- Add test coverage for shared utilities.

### Phase 3
- Refine image algorithms and add configurable export presets.
- Evaluate proxy deployment for public production usage.

## 16. Definition of Done For This Refactor Track
- New docs are in place.
- App is no longer centered around a monolithic feature file.
- Shared libraries own external API and file processing concerns.
- Project can be built and linted locally.
- Backlog for the next iteration is explicitly captured in `Tasks.md`.
