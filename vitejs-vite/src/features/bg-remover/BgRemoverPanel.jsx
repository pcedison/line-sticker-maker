import {
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  Sparkles,
  StopCircle,
  Upload,
} from 'lucide-react';
import {
  BACKGROUND_MODES,
  BACKGROUND_MODE_COPY,
} from '../../lib/constants/line';
import { useBgRemover } from './useBgRemover';

const BgRemoverPanel = () => {
  const {
    files,
    isProcessing,
    bgMode,
    setBgMode,
    errorMsg,
    applyFiles,
    clearFiles,
    processQueue,
    requestStopProcessing,
    downloadItem,
    downloadAll,
    stats,
  } = useBgRemover();

  return (
    <div className="space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
            <Sparkles size={14} />
            Semantic Workflow
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI 魔法語意去背</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
              先用 Gemini 把你要保留的元素重繪到純綠幕，再由前端執行透明化與邊緣修整。
            </p>
          </div>
        </div>

        <div className="grid gap-2 rounded-3xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300 sm:grid-cols-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Total
            </div>
            <div className="mt-1 font-semibold text-white">{stats.total}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Done
            </div>
            <div className="mt-1 font-semibold text-emerald-300">{stats.done}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Active
            </div>
            <div className="mt-1 font-semibold text-violet-300">
              {stats.processing}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Error
            </div>
            <div className="mt-1 font-semibold text-rose-300">{stats.error}</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Upload
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                批次匯入圖片
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-white/15 bg-slate-950/60 px-6 py-10 text-center transition hover:border-violet-400/35 hover:bg-slate-900">
              <Upload className="mb-3 h-10 w-10 text-slate-400" />
              <div className="text-sm font-medium text-white">選擇多張圖片</div>
              <div className="mt-2 text-xs leading-6 text-slate-400">
                目前單批上限 30 張。適合貼圖完稿、截圖、或已生成的原始圖。
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  applyFiles(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Mode
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                保留元素模式
              </div>
            </div>

            <div className="grid gap-3">
              {BACKGROUND_MODES.map((mode) => {
                const isActive = bgMode === mode.id;

                return (
                  <label
                    key={mode.id}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? 'border-violet-400/40 bg-violet-400/10 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name="bgMode"
                      checked={isActive}
                      onChange={() => setBgMode(mode.id)}
                    />
                    <div className="font-semibold">{mode.label}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-400">
                      {mode.description}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={processQueue}
              disabled={isProcessing || files.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  處理中
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  開始去背
                </>
              )}
            </button>

            <button
              type="button"
              onClick={requestStopProcessing}
              disabled={!isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <StopCircle size={16} />
              停止後續處理
            </button>

            <button
              type="button"
              onClick={downloadAll}
              disabled={isProcessing || stats.done === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              下載完成項目
            </button>

            <button
              type="button"
              onClick={clearFiles}
              disabled={isProcessing || files.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              清空清單
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Queue
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {BACKGROUND_MODE_COPY[bgMode]} 模式結果
                </div>
              </div>
              <div className="text-sm text-slate-400">
                已選 {stats.total} 張，完成 {stats.done} 張
              </div>
            </div>
          </div>

          {files.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-16 text-center">
              <Upload className="mb-4 h-12 w-12 text-slate-500" />
              <h3 className="text-xl font-bold text-white">等待批次圖片匯入</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                匯入後即可用 AI 語意模式選擇保留本體、文字、道具，或直接進行綠幕去背。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {files.map((file) => (
                <article
                  key={file.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70"
                >
                  <div className="checkerboard flex aspect-square items-center justify-center border-b border-white/10 p-4">
                    {file.status === 'processing' ? (
                      <RefreshCw className="h-8 w-8 animate-spin text-violet-300" />
                    ) : (
                      <img
                        src={file.resultData || file.originalData}
                        alt={file.filename}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>

                  <div className="space-y-3 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className="truncate text-sm font-semibold text-white"
                          title={file.filename}
                        >
                          {file.filename}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-slate-400">
                          {file.status === 'ready' && '等待處理'}
                          {file.status === 'processing' && 'AI 與本地去背進行中'}
                          {file.status === 'done' && '處理完成'}
                          {file.status === 'error' &&
                            (file.errorMessage || '處理失敗')}
                        </div>
                      </div>

                      {file.status === 'done' && (
                        <div className="rounded-full bg-emerald-400/10 p-1 text-emerald-300">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadItem(file.id)}
                      disabled={file.status !== 'done'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download size={16} />
                      下載 PNG
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BgRemoverPanel;
