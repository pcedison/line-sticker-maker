import {
  AlertCircle,
  Clock3,
  Download,
  Image as ImageIcon,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  Square,
  Trash2,
  Upload,
  WandSparkles,
} from 'lucide-react';
import { useStickerGenerator } from './useStickerGenerator';
import { isGeneratorLabEnabled } from '../../lib/config/runtime';
import {
  STICKER_BACKGROUND_MODE_COPY,
  STICKER_BACKGROUND_OPTIONS,
} from '../../lib/constants/line';

const GeneratorPanel = () => {
  const {
    hasGeminiApiKey,
    sourceImage,
    sourceFileName,
    styleInput,
    setStyleInput,
    texts,
    backgroundMode,
    setBackgroundMode,
    themeInput,
    setThemeInput,
    isThinking,
    isGenerating,
    generatedGrid,
    splitImages,
    errorMsg,
    generationHistory,
    selectedHistoryId,
    applySourceFile,
    clearSourceImage,
    loadDemoSource,
    updateText,
    generateInspiration,
    startGeneration,
    stopGeneration,
    splitGeneratedGrid,
    downloadSticker,
    downloadAll,
    restoreHistoryItem,
  } = useStickerGenerator();
  const showGeneratorLab = isGeneratorLabEnabled();

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Step 1
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">上傳角色參考圖</h2>
            </div>
          </div>

          {showGeneratorLab && !sourceImage && (
            <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                    <WandSparkles size={16} />
                    Quick Verify Lab
                  </div>
                  <p className="mt-1 text-xs leading-6 text-sky-100/80">
                    僅在測試模式顯示。可直接載入內建角色圖與預設主題，快速驗證生成流程。
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="load-demo-source-button"
                  onClick={loadDemoSource}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-sky-50 transition hover:bg-sky-300/20"
                >
                  <Sparkles size={16} />
                  載入測試素材
                </button>
              </div>
            </div>
          )}

          {!sourceImage ? (
            <label
              data-testid="source-upload-trigger"
              className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/40 px-6 py-12 text-center transition hover:border-emerald-400/40 hover:bg-slate-900"
            >
              <Upload className="mb-3 h-10 w-10 text-slate-400" />
              <div className="text-sm font-medium text-white">
                點擊或拖曳上傳角色圖片
              </div>
              <div className="mt-2 text-xs leading-5 text-slate-400">
                支援 PNG / JPG / WEBP。建議使用主體清晰、構圖完整的角色圖。
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                data-testid="source-upload-input"
                onChange={(event) => applySourceFile(event.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                <img
                  src={sourceImage}
                  alt="Reference"
                  className="h-64 w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Current File
                  </div>
                  <div className="truncate text-sm font-medium text-white">
                    {sourceFileName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSourceImage}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  清除
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              Step 2
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">設定風格與文字</h2>
          </div>

          <div className="mb-6 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-100">
              <Sparkles size={16} />
              AI 文案企劃
            </div>

            {!hasGeminiApiKey && (
              <div className="mb-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                需先設定 <code className="rounded bg-slate-950/50 px-1.5 py-0.5 text-xs">VITE_GEMINI_API_KEY</code>{' '}
                才能使用 AI 文案企劃與四宮格生成。
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={themeInput}
                onChange={(event) => setThemeInput(event.target.value)}
                placeholder="例如：厭世上班族、戀愛小恐龍、貓咪客服"
                data-testid="theme-input"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-violet-400/40"
              />
              <button
                type="button"
                onClick={generateInspiration}
                disabled={isThinking || !themeInput.trim() || !hasGeminiApiKey}
                data-testid="generate-copy-button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isThinking ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    企劃中
                  </>
                ) : (
                  '生成文案'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                背景模式
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {STICKER_BACKGROUND_OPTIONS.map((option) => {
                  const isActive = backgroundMode === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      data-testid={`background-mode-${option.id}`}
                      onClick={() => setBackgroundMode(option.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isActive
                          ? 'border-emerald-400/35 bg-emerald-400/12 text-white'
                          : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20 hover:bg-slate-950/80'
                      }`}
                    >
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="mt-1 text-xs leading-6 text-slate-400">
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                `不要背景` 會優先保留主體與道具；`保留背景` 會保留場景並盡量修正內框與裁切範圍。
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                整體風格描述
              </label>
              <input
                type="text"
                value={styleInput}
                onChange={(event) => setStyleInput(event.target.value)}
                data-testid="style-input"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40"
                placeholder="例如：可愛插畫、粉彩黏土、Q版漫畫"
              />
              <p className="mt-2 text-xs leading-6 text-slate-500">
                最終輸出會由系統自動覆蓋繁體中文標題，降低模型自行寫字時混入英文或錯字的風險。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {texts.map((text, index) => (
                <div key={`${index}-${text}`}>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    第 {index + 1} 格文字
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(event) => updateText(index, event.target.value)}
                    data-testid={`sticker-text-${index}`}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40"
                    placeholder="輸入貼圖短句"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Step 3
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">生成與輸出</h2>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isGenerating ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              <Square size={16} fill="currentColor" />
              停止生成
            </button>
          ) : (
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => startGeneration(false)}
                disabled={!sourceImage || !hasGeminiApiKey}
                data-testid="start-generation-button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={16} fill="currentColor" />
                開始生成四宮格
              </button>

              <button
                type="button"
                onClick={() => startGeneration(true)}
                disabled={!generatedGrid || !hasGeminiApiKey}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} />
                同樣風格追加生成
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Workspace
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">生成結果與切圖</h2>
          </div>
          {splitImages.length > 0 && (
            <button
              type="button"
              onClick={downloadAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Download size={16} />
              全部下載 ZIP
            </button>
          )}
        </div>

        {!generatedGrid && !isGenerating ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-16 text-center">
            <ImageIcon className="mb-4 h-14 w-14 text-slate-500" />
            <h3 className="text-xl font-bold text-white">準備生成你的下一組貼圖</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
              上傳角色圖後，先用 AI 文案企劃探索主題，再輸出四宮格貼圖並切成可下載的 LINE 規格 PNG。
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-emerald-400/15 bg-emerald-400/5 px-6 py-16 text-center">
            <RefreshCw className="mb-4 h-12 w-12 animate-spin text-emerald-300" />
            <h3 className="text-xl font-bold text-white">AI 正在生成四宮格</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              會依照角色參考圖、風格描述與四句文案輸出一張 2x2 的貼圖網格。
            </p>
          </div>
        ) : (
          <div className="space-y-8 pt-6">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
              <img
                src={generatedGrid}
                alt="Generated sticker grid"
                data-testid="generated-grid"
                className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10"
              />
            </div>

            {generationHistory.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Recent Versions
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      最近生成紀錄
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    共保留 {generationHistory.length} 筆版本，可快速切回比較。
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {generationHistory.map((item, index) => {
                    const isActive = selectedHistoryId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => restoreHistoryItem(item.id)}
                        className={`rounded-3xl border p-4 text-left transition ${
                          isActive
                            ? 'border-emerald-400/35 bg-emerald-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                            <img
                              src={item.grid}
                              alt={`歷史版本 ${index + 1}`}
                              className="h-24 w-24 object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                              <Clock3 size={14} />
                              Version {generationHistory.length - index}
                            </div>
                          <div className="mt-2 line-clamp-2 text-sm font-semibold text-white">
                              {item.style}
                            </div>
                            <div className="mt-2">
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                                {STICKER_BACKGROUND_MODE_COPY[item.backgroundMode || 'no_background']}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.texts.map((text) => (
                                <span
                                  key={`${item.id}-${text}`}
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                                >
                                  {text}
                                </span>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-slate-500">
                              {isActive ? '目前工作區使用中' : '點擊切換到此版本'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {splitImages.length === 0 ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={splitGeneratedGrid}
                  data-testid="split-grid-button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  <Scissors size={16} />
                  一鍵切成 4 張 LINE 貼圖
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">分割結果</h3>
                    <p className="text-sm text-slate-400">
                      已完成 4 張獨立貼圖，並套用 LINE 尺寸裁切。
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {splitImages.map((image, index) => (
                    <article
                      key={`sticker-${index}`}
                      data-testid={`split-sticker-${index}`}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70"
                    >
                      <div className="checkerboard aspect-[370/320] p-3">
                        <img
                          src={image}
                          alt={`Sticker ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="border-t border-white/10 px-4 py-4">
                        <div
                          className="truncate text-center text-sm font-semibold text-white"
                          title={texts[index]}
                        >
                          {texts[index] || `圖 ${index + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadSticker(index)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                        >
                          <Download size={16} />
                          下載 PNG
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default GeneratorPanel;
