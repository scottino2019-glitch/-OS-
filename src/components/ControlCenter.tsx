import React from 'react';
import { usePhone } from '../context/PhoneContext';
import {
  Wifi,
  Signal,
  Bluetooth,
  Flashlight,
  Sun,
  BellOff,
  Volume2,
  Calculator,
  Play,
  SkipForward,
  X
} from 'lucide-react';

export const ControlCenter: React.FC = () => {
  const {
    isControlCenterOpen,
    setControlCenterOpen,
    settings,
    updateSettings,
    openApp,
    t
  } = usePhone();

  if (!isControlCenterOpen) return null;

  return (
    <div
      onClick={() => setControlCenterOpen(false)}
      className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xl flex flex-col p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm mx-auto space-y-3 pt-2"
      >
        {/* Top title and dismiss */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-white tracking-wide">
            {t('控制中心', 'Centro di Controllo')}
          </span>
          <button
            onClick={() => setControlCenterOpen(false)}
            className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2x2 Primary Connectivity Card */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Wi-Fi & Cellular Card */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-white/80 shadow-md space-y-2">
            <button
              onClick={() => updateSettings({ wifi: !settings.wifi })}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                settings.wifi
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Wifi size={20} />
              <div className="text-left leading-tight">
                <div className="text-xs font-bold">Wi-Fi 7</div>
                <div className="text-[11px] opacity-80">{settings.wifi ? '极光5G_Pro' : '已关闭'}</div>
              </div>
            </button>

            <button
              onClick={() => updateSettings({ cellular: !settings.cellular })}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                settings.cellular
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Signal size={20} />
              <div className="text-left leading-tight">
                <div className="text-xs font-bold">蜂窝网络</div>
                <div className="text-[11px] opacity-80">{settings.cellular ? '中国移动 5G+' : '已停用'}</div>
              </div>
            </button>
          </div>

          {/* Quick Music Pill */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-white/80 shadow-md flex flex-col justify-between">
            <div>
              <div className="text-xs text-amber-700 font-bold">正在播放</div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">青花瓷 · 极光Hi-Fi</div>
              <div className="text-xs text-slate-500 truncate">空间音频高保真</div>
            </div>

            <div className="flex items-center justify-around pt-2">
              <button className="text-slate-800 hover:text-indigo-600 p-1">
                <Play size={20} className="fill-slate-800" />
              </button>
              <button className="text-slate-800 hover:text-indigo-600 p-1">
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sliders: Brightness & Volume */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-white/80 shadow-md flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <Sun size={18} className="text-amber-500" />
              <span className="font-mono text-xs">{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.brightness}
              onChange={e => updateSettings({ brightness: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 font-semibold">{t('屏幕亮度', 'Luminosità')}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-white/80 shadow-md flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <Volume2 size={18} className="text-sky-600" />
              <span className="font-mono text-xs">{settings.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={e => updateSettings({ volume: parseInt(e.target.value, 10) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-xs text-slate-600 font-semibold">{t('多媒体音量', 'Volume')}</span>
          </div>
        </div>

        {/* Quick Function Badges Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Flashlight */}
          <button
            onClick={() => updateSettings({ flashlight: !settings.flashlight })}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              settings.flashlight
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/90 text-slate-800 border border-white/80'
            }`}
          >
            <Flashlight size={20} />
            <span className="text-xs font-bold">{t('手电筒', 'Torcia')}</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => updateSettings({ bluetooth: !settings.bluetooth })}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              settings.bluetooth
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white/90 text-slate-800 border border-white/80'
            }`}
          >
            <Bluetooth size={20} />
            <span className="text-xs font-bold">{t('蓝牙', 'Bluetooth')}</span>
          </button>

          {/* DND */}
          <button
            onClick={() => updateSettings({ dnd: !settings.dnd })}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              settings.dnd
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white/90 text-slate-800 border border-white/80'
            }`}
          >
            <BellOff size={20} />
            <span className="text-xs font-bold">{t('勿扰', 'Silenzio')}</span>
          </button>

          {/* Calculator Shortcut */}
          <button
            onClick={() => {
              setControlCenterOpen(false);
              openApp('calculator');
            }}
            className="p-3 rounded-2xl bg-white/90 text-slate-800 border border-white/80 flex flex-col items-center justify-center gap-1.5 hover:bg-white shadow-xs transition-colors"
          >
            <Calculator size={20} />
            <span className="text-xs font-bold">{t('计算器', 'Calcolo')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
