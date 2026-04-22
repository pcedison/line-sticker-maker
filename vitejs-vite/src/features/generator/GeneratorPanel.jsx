import {
  AlertCircle,
  Download,
  Image as ImageIcon,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStickerGenerator } from './useStickerGenerator';

const GeneratorPanel = () => {
  const {
    sourceImage,
    sourceFileName,
    styleInput,
    setStyleInput,
    texts,
    themeInput,
    setThemeInput,
    isThinking,
    isGenerating,
    generatedGrid,
    splitImages,
    errorMsg,
    applySourceFile,
    clearSourceImage,
    updateText,
    generateInspiration,
    startGeneration,
    stopGeneration,
    splitGeneratedGrid,
    downloadSticker,
    downloadAll,
  } = useStickerGenerator();

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

          {!sourceImage ? (
            <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/40 px-6 py-12 text-center transition hover:border-emerald-400/40 hover:bg-slate-900">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={themeInput}
                onChange={(event) => setThemeInput(event.target.value)}
                placeholder="例如：厭世上班族、戀愛小恐龍、貓咪客服"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-violet-400/40"
              />
              <button
                type="button"
                onClick={generateInspiration}
                disabled={isThinking || !themeInput.trim()}
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
                整體風格描述
              </label>
              <input
                type="text"
                value={styleInput}
                onChange={(event) => setStyleInput(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40"
                placeholder="例如：可愛插畫、粉彩黏土、Q版漫畫"
              />
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
                disabled={!sourceImage}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={16} fill="currentColor" />
                開始生成四宮格
              </button>

              <button
                type="button"
                onClick={() => startGeneration(true)}
                disabled={!generatedGrid}
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
                className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10"
              />
            </div>

            {splitImages.length === 0 ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={splitGeneratedGrid}
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
