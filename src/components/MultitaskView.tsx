import React from 'react';
import { usePhone } from '../context/PhoneContext';
import { Trash2, X, Layers } from 'lucide-react';

export const MultitaskView: React.FC = () => {
  const {
    recentApps,
    openApp,
    killApp,
    clearAllRecentApps,
    isMultitaskOpen,
    setMultitaskOpen,
    t
  } = usePhone();

  if (!isMultitaskOpen) return null;

  const APP_NAMES: Record<string, string> = {
    notes: '便签 (Note)',
    calendar: '日历 (Calendario)',
    editor: '轻编辑 (Editor)',
    calculator: '计算器 (Calcolo)',
    gallery: '相册图库 (Galleria)',
    camera: '相机 (Fotocamera)',
    clock: '时钟 (Orologio)',
    market: '应用市场 (App Market)',
    settings: '系统设置 (Impostazioni)',
    phone: '电话 (Telefono)',
    browser: '浏览器 (Browser)'
  };

  return (
    <div
      onClick={() => setMultitaskOpen(false)}
      className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-2xl flex flex-col justify-between p-4 animate-in fade-in select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 px-2">
        <span className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <span>{t('多任务后台', 'Applicazioni Recenti')}</span>
        </span>
        <button
          onClick={() => setMultitaskOpen(false)}
          className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cards Horizontal Carousel */}
      <div
        onClick={e => e.stopPropagation()}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar py-6 px-4"
      >
        {recentApps.length === 0 ? (
          <div className="mx-auto text-center py-12 text-slate-300">
            <p className="text-base font-bold">{t('后台暂无运行中的应用', 'Nessuna app aperta')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('轻触屏幕空白处返回桌面', 'Tocca per tornare alla home')}</p>
          </div>
        ) : (
          recentApps.map(appId => {
            const displayName = APP_NAMES[appId] || appId;
            return (
              <div
                key={appId}
                className="shrink-0 w-48 h-72 bg-white rounded-3xl p-3 flex flex-col justify-between shadow-2xl relative group hover:border-indigo-500 cursor-pointer active:scale-98 transition-all border border-slate-200"
                onClick={() => {
                  openApp(appId);
                  setMultitaskOpen(false);
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      killApp(appId);
                    }}
                    title="Chiudi app"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Card preview representation */}
                <div className="flex-1 my-2 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-3 text-slate-500">
                  <div className="w-13 h-13 rounded-[22%] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-2 shadow-md">
                    {displayName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">点击唤醒打开</span>
                </div>

                {/* Card footer */}
                <div className="text-xs text-slate-400 text-center font-medium">
                  极光后台保活中
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Clear RAM Button */}
      <div className="flex justify-center pb-4">
        <button
          onClick={clearAllRecentApps}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-xl active:scale-95 transition-all text-xs font-bold hover:bg-slate-50"
        >
          <Trash2 size={16} className="text-amber-600" />
          <span>{t('一键清理后台', 'Chiudi Tutto (Libera RAM)')}</span>
        </button>
      </div>
    </div>
  );
};
