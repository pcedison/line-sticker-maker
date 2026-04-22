import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { NoticeContext } from './NoticeContext';

const toneStyles = {
  info: {
    icon: Info,
    wrapper:
      'border-sky-400/25 bg-sky-500/10 text-sky-50 shadow-[0_18px_40px_-24px_rgba(14,165,233,0.55)]',
    iconColor: 'text-sky-300',
  },
  success: {
    icon: CheckCircle2,
    wrapper:
      'border-emerald-400/25 bg-emerald-500/10 text-emerald-50 shadow-[0_18px_40px_-24px_rgba(16,185,129,0.55)]',
    iconColor: 'text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    wrapper:
      'border-rose-400/25 bg-rose-500/10 text-rose-50 shadow-[0_18px_40px_-24px_rgba(244,63,94,0.55)]',
    iconColor: 'text-rose-300',
  },
};

export const NoticeProvider = ({ children }) => {
  const [notices, setNotices] = useState([]);
  const timersRef = useRef(new Map());
  const nextIdRef = useRef(0);

  const dismissNotice = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const notify = useCallback(({ title, message, tone = 'info', duration = 4200 }) => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `notice-${nextIdRef.current++}`;

    setNotices((current) => [
      ...current,
      {
        id,
        title,
        message,
        tone,
      },
    ]);

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        dismissNotice(id);
      }, duration);

      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissNotice]);

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      notify,
      dismissNotice,
    }),
    [dismissNotice, notify]
  );

  return (
    <NoticeContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {notices.map((notice) => {
          const style = toneStyles[notice.tone] || toneStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={notice.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-4 backdrop-blur-xl ${style.wrapper}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{notice.title}</div>
                  {notice.message && (
                    <div className="mt-1 text-sm leading-6 text-slate-200/90">
                      {notice.message}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissNotice(notice.id)}
                  className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-200 transition hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NoticeContext.Provider>
  );
};
