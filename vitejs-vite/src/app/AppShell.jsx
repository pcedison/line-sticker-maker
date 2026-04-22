import { useState } from 'react';
import { AlertCircle, Layers, Scissors, Sparkles, Wand2 } from 'lucide-react';
import GeneratorPanel from '../features/generator/GeneratorPanel';
import ResizerPanel from '../features/resizer/ResizerPanel';
import BgRemoverPanel from '../features/bg-remover/BgRemoverPanel';
import { HAS_GEMINI_API_KEY } from '../lib/config/env';
import { NoticeProvider } from './NoticeCenter';

const tabs = [
  {
    id: 'generator',
    label: '表情生成器',
    icon: Sparkles,
    description: '參考圖 + 文案企劃 + 四宮格生成',
  },
  {
    id: 'resizer',
    label: '尺寸縮放工具',
    icon: Scissors,
    description: 'Main / Tab 尺寸快速輸出',
  },
  {
    id: 'bgremover',
    label: 'AI 魔法去背',
    icon: Wand2,
    description: '語意提取 + 綠幕去背處理',
  },
];

const AppShellContent = () => {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_30%),linear-gradient(180deg,_#020617,_#0f172a)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                <Layers size={14} />
                Line Sticker Master Toolkit
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Line 貼圖全能工具箱
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  以模組化架構重建的貼圖工作站，集中處理靈感企劃、
                  貼圖生成、尺寸規格化與語意去背。
                </p>
              </div>
            </div>

            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300 shadow-soft sm:grid-cols-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Architecture
                </div>
                <div className="mt-1 font-semibold text-white">Feature-first</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Runtime
                </div>
                <div className="mt-1 font-semibold text-white">Client-side</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Status
                </div>
                <div className="mt-1 font-semibold text-emerald-300">
                  Refactor Active
                </div>
              </div>
            </div>
          </div>

          {!HAS_GEMINI_API_KEY && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">尚未設定 Gemini API 金鑰</p>
                <p className="text-amber-100/90">
                  生成與 AI 去背功能需要在{' '}
                  <code className="rounded bg-slate-950/50 px-1.5 py-0.5 text-xs text-amber-50">
                    vitejs-vite/.env
                  </code>{' '}
                  中設定{' '}
                  <code className="rounded bg-slate-950/50 px-1.5 py-0.5 text-xs text-amber-50">
                    VITE_GEMINI_API_KEY
                  </code>
                  。若你是在 StackBlitz 的 GitHub preview 中工作，請優先到{' '}
                  <code className="rounded bg-slate-950/50 px-1.5 py-0.5 text-xs text-amber-50">
                    Settings &gt; Variables
                  </code>{' '}
                  為 repo 設定同名變數，避免新開 workspace 時遺失。尺寸縮放功能仍可正常使用。
                </p>
              </div>
            </div>
          )}

          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group min-w-[180px] rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-emerald-400/40 bg-emerald-400/12 text-white shadow-soft'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Icon
                      size={16}
                      className={isActive ? 'text-emerald-300' : 'text-slate-400'}
                    />
                    {tab.label}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-400 transition group-hover:text-slate-300">
                    {tab.description}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'generator' && <GeneratorPanel />}
        {activeTab === 'resizer' && <ResizerPanel />}
        {activeTab === 'bgremover' && <BgRemoverPanel />}
      </main>
    </div>
  );
};

const AppShell = () => (
  <NoticeProvider>
    <AppShellContent />
  </NoticeProvider>
);

export default AppShell;
