import React from 'react';
import { usePhone } from '../context/PhoneContext';
import { Wifi, Signal, Battery, Music, Bell } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    currentTime,
    settings,
    isControlCenterOpen,
    setControlCenterOpen,
    isNotificationOpen,
    setNotificationOpen
  } = usePhone();

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');

  const isDarkWallpaper =
    settings.wallpaper?.includes('lacquer') ||
    settings.wallpaper?.includes('crimson') ||
    settings.theme === 'dark';

  const textColor = isDarkWallpaper ? 'text-amber-100' : 'text-stone-900 font-bold';
  const subTextColor = isDarkWallpaper ? 'text-amber-200/80' : 'text-stone-700';
  const iconStroke = isDarkWallpaper ? 'text-amber-100' : 'text-stone-900';

  return (
    <div className={`h-8 px-4 flex items-center justify-between ${textColor} select-none z-40 relative text-xs font-semibold tracking-tight shrink-0`}>
      {/* Left side: Time & Notification trigger */}
      <div
        onClick={() => setNotificationOpen(!isNotificationOpen)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all py-1"
        title="下拉打开通知中心"
      >
        <span className="font-bold text-sm tracking-normal">{hours}:{minutes}</span>
        <span className={`text-xs font-medium hidden sm:inline ${subTextColor}`}>
          {settings.cellular ? '中国移动 5G+' : '无服务'}
        </span>
      </div>

      {/* Center: Dynamic Island / Camera punch hole */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-center">
        <div className="h-5 px-3 rounded-full bg-black/90 border border-white/20 flex items-center gap-1.5 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900" />
          </div>
          {settings.flashlight && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Right side: Signals, Battery & Control Center trigger */}
      <div
        onClick={() => setControlCenterOpen(!isControlCenterOpen)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all py-1"
        title="下拉打开控制中心"
      >
        <Signal size={14} className={settings.cellular ? iconStroke : 'text-slate-400'} />
        {settings.wifi && <Wifi size={14} className={iconStroke} />}
        <div className="flex items-center gap-1 text-xs font-mono font-medium">
          <span>{settings.brightness}%</span>
          <div className={`w-5 h-2.5 rounded border p-0.5 flex items-center relative ${settings.theme === 'light' ? 'border-slate-800' : 'border-white'}`}>
            <div className="h-full bg-emerald-500 rounded-xs w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
