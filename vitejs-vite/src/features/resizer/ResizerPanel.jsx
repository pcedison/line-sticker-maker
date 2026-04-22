import { Download, Scissors, Upload } from 'lucide-react';
import { useStickerResizer } from './useStickerResizer';

const ResizerPanel = () => {
  const { image, filename, options, applyFile, toggleOption, exportImages } =
    useStickerResizer();

  return (
    <div className="mx-auto max-w-4xl rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            <Scissors size={14} />
            Export Presets
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Line 貼圖縮放工具</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              上傳完成稿後，即可快速輸出 LINE 商店常用的 Main 與 Tab 尺寸圖檔。
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-white/15 bg-slate-950/40 px-6 py-10 text-center transition hover:border-sky-400/35 hover:bg-slate-900">
            <Upload className="mb-3 h-10 w-10 text-slate-400" />
            <div className="text-sm font-medium text-white">上傳貼圖成品</div>
            <div className="mt-2 text-xs leading-6 text-slate-400">
              圖片會保留透明背景；Main 採等比例縮放，Tab 採規格化變形。
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => applyFile(event.target.files?.[0])}
            />
          </label>
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Preview
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {filename || '尚未選擇圖片'}
                </div>
              </div>
            </div>

            <div className="checkerboard flex min-h-[280px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/50 p-6">
              {image ? (
                <img
                  src={image}
                  alt="Resize preview"
                  className="max-h-[240px] max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-sm leading-7 text-slate-500">
                  選擇一張圖片後，這裡會顯示預覽。
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-sky-400/20">
              <input
                type="checkbox"
                checked={options.main}
                onChange={(event) => toggleOption('main', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <div className="font-semibold text-white">
                  小舖縮圖 Main 240x240
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-400">
                  保持原圖比例，自動置中並保留透明區域。
                </div>
              </div>
            </label>

            <label className="flex gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-sky-400/20">
              <input
                type="checkbox"
                checked={options.tab}
                onChange={(event) => toggleOption('tab', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <div className="font-semibold text-white">標籤縮圖 Tab 96x74</div>
                <div className="mt-1 text-sm leading-6 text-slate-400">
                  依照官方規格輸出，允許直接拉伸變形。
                </div>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={exportImages}
            disabled={!image || (!options.main && !options.tab)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            輸出所選尺寸
          </button>
        </section>
      </div>
    </div>
  );
};

export default ResizerPanel;
