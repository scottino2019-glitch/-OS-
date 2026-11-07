import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { getLunarDateString, WEEKDAYS_ZH } from '../utils/lunar';
import { sound } from '../utils/sound';
import {
  FileText,
  Calendar as CalendarIcon,
  Code,
  Calculator,
  Image as ImageIcon,
  Clock,
  Store,
  Settings,
  Phone,
  Compass,
  Camera,
  Play,
  Pause,
  Sun,
  Activity,
  Flame,
  Globe,
  Gamepad2,
  Palette,
  BookOpen,
  Sparkles,
  Lock,
  Unlock,
  Flashlight,
  Music,
  Video,
  ShoppingBag,
  MessageSquare,
  Heart,
  Zap,
  Coffee,
  Cloud,
  Mail,
  Star,
  MapPin,
  Shield,
  Layers
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  FileText,
  Calendar: CalendarIcon,
  Code,
  Calculator,
  Image: ImageIcon,
  Clock,
  Store,
  Settings,
  Phone,
  Compass,
  Camera,
  Globe,
  Gamepad2,
  Palette,
  BookOpen,
  Sparkles,
  Music,
  Video,
  ShoppingBag,
  MessageSquare,
  Heart,
  Zap,
  Coffee,
  Cloud,
  Mail,
  Star,
  MapPin,
  Shield,
  Layers
};

export const HomeScreen: React.FC = () => {
  const {
    currentTime,
    isLocked,
    setLocked,
    openApp,
    installedApps,
    notes,
    calendarEvents,
    settings,
    updateSettings,
    t
  } = usePhone();

  // Mini music widget playback
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const lunar = getLunarDateString(currentTime);
  const weekday = WEEKDAYS_ZH[currentTime.getDay()];

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');

  const isDark =
    settings.wallpaper?.includes('lacquer') ||
    settings.wallpaper?.includes('crimson') ||
    settings.wallpaper?.includes('night') ||
    settings.wallpaper?.startsWith('data:') ||
    settings.wallpaper?.startsWith('http') ||
    settings.theme === 'dark';

  // Lock Screen View
  if (isLocked) {
    return (
      <div className={`flex flex-col h-full justify-between p-5 select-none relative overflow-hidden z-10 ${
        isDark ? 'text-white' : 'text-stone-900'
      }`}>
        {/* Top Clock & Lunar Date */}
        <div className="text-center pt-8">
          <div className={`flex items-center justify-center gap-1.5 text-xs font-bold mb-1 ${
            isDark ? 'text-amber-400 drop-shadow-sm' : 'text-red-900'
          }`}>
            <Lock size={15} />
            <span>极光面容识别已就绪</span>
          </div>
          <div className={`text-6xl font-light tracking-tight font-mono my-1 ${
            isDark ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]' : 'text-stone-950'
          }`}>
            {hours}:{minutes}
          </div>
          <div className={`text-base font-extrabold ${
            isDark ? 'text-amber-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]' : 'text-stone-900'
          }`}>
            {currentTime.getMonth() + 1}月{currentTime.getDate()}日 {weekday}
          </div>
          <div className={`text-sm font-bold mt-1 font-serif ${
            isDark ? 'text-amber-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]' : 'text-stone-800'
          }`}>
            {lunar.fullLunar} {lunar.solarTerm ? `· ${lunar.solarTerm}` : ''}
          </div>
        </div>

        {/* Lock Screen Glance Widget */}
        <div className={`mx-auto w-full max-w-xs backdrop-blur-md rounded-2xl p-3.5 border shadow-sm flex items-center justify-between text-xs ${
          isDark ? 'bg-stone-900/85 border-stone-700 text-white' : 'bg-[#f4ece1]/90 border-stone-300 text-stone-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-600/15 text-amber-800'
            }`}>
              <Sun size={20} />
            </div>
            <div>
              <div className="font-bold text-sm">北京 · 晴 22°C</div>
              <div className={`text-xs font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                空气优 AQI 24 · 微风舒适
              </div>
            </div>
          </div>
          <span className="text-xs text-emerald-900 font-bold bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300">
            宜出行
          </span>
        </div>

        {/* Bottom Lock Shortcuts & Swipe to Unlock */}
        <div className="pb-6 space-y-4">
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => updateSettings({ flashlight: !settings.flashlight })}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                settings.flashlight
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-amber-400/40 scale-105'
                  : isDark
                  ? 'bg-stone-900/80 text-white border border-stone-700'
                  : 'bg-[#f4ece1]/90 text-stone-800 border border-stone-300'
              }`}
            >
              <Flashlight size={20} />
            </button>

            <button
              onClick={() => {
                setLocked(false);
                sound.playSuccess();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold tracking-wide border border-red-800 active:scale-95 transition-all shadow-md"
            >
              <Unlock size={16} />
              <span>{t('轻触解锁手机', 'Tocca per sbloccare')}</span>
            </button>

            <button
              onClick={() => {
                setLocked(false);
                openApp('camera');
              }}
              className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-sm active:scale-95 transition-all ${
                isDark
                  ? 'bg-stone-900/80 text-white border-stone-700'
                  : 'bg-[#f4ece1]/90 text-stone-800 border-stone-300'
              }`}
            >
              <Camera size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Built-in Apps Definition
  const BUILT_IN_APPS = [
    {
      id: 'notes',
      name: '便签',
      subName: 'Note',
      icon: 'FileText',
      gradient: 'from-amber-500 to-orange-600',
      badge: notes.length > 0 ? String(notes.length) : undefined
    },
    {
      id: 'calendar',
      name: '日历',
      subName: 'Calendario',
      icon: 'Calendar',
      gradient: 'from-emerald-500 to-teal-700',
      badge: calendarEvents.length > 0 ? String(calendarEvents.length) : undefined
    },
    {
      id: 'editor',
      name: '轻编辑',
      subName: 'Editor',
      icon: 'Code',
      gradient: 'from-blue-600 to-indigo-700',
      badge: 'IDE'
    },
    {
      id: 'calculator',
      name: '换算计算',
      subName: 'Calcolo',
      icon: 'Calculator',
      gradient: 'from-red-600 to-amber-600',
      badge: '大写'
    },
    {
      id: 'gallery',
      name: '相册',
      subName: 'Galleria',
      icon: 'Image',
      gradient: 'from-pink-600 to-purple-700'
    },
    {
      id: 'clock',
      name: '时钟',
      subName: 'Orologio',
      icon: 'Clock',
      gradient: 'from-stone-700 to-stone-900'
    },
    {
      id: 'market',
      name: '应用市场',
      subName: 'App Store',
      icon: 'Store',
      gradient: 'from-purple-600 to-rose-600',
      badge: 'HOT'
    },
    {
      id: 'settings',
      name: '系统设置',
      subName: 'Impostazioni',
      icon: 'Settings',
      gradient: 'from-slate-700 to-zinc-800',
      badge: '备份'
    }
  ];

  return (
    <div className="flex flex-col h-full justify-between p-2.5 sm:p-3 select-none relative overflow-hidden z-10">
      {/* Top Header: Clean, Elegant Clock & Lunar Date (Compact & Shrink-0) */}
      <div className="pt-1 pb-0.5 px-2 text-center shrink-0">
        <div className={`text-4xl font-light font-mono tracking-tight leading-none ${
          isDark ? 'text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]' : 'text-stone-900'
        }`}>
          {hours}:{minutes}
        </div>
        <div className={`text-xs font-bold mt-1 flex items-center justify-center gap-1.5 font-serif ${
          isDark ? 'text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]' : 'text-stone-800'
        }`}>
          <span>{currentTime.getMonth() + 1}月{currentTime.getDate()}日 {weekday}</span>
          <span className={isDark ? 'text-white/60' : 'text-stone-400'}>·</span>
          <span className={isDark ? 'text-amber-200' : 'text-stone-700'}>{lunar.fullLunar}</span>
          <span className={isDark ? 'text-white/60' : 'text-stone-400'}>·</span>
          <span className={isDark ? 'text-amber-300 font-sans font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : 'text-amber-800 font-sans font-semibold'}>晴 22°C</span>
        </div>
      </div>

      {/* Main Apps Grid (min-h-0 guarantees dock is NEVER pushed off-screen) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar touch-scroll py-2 px-1">
        <div className="grid grid-cols-4 gap-y-3.5 gap-x-2">
          {/* Native Built-in Apps */}
          {BUILT_IN_APPS.map(app => {
            const IconComp = ICON_MAP[app.icon] || Globe;
            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-[22%] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-xs group-hover:shadow-md transition-all squircle`}
                  >
                    <IconComp size={26} />
                  </div>
                  {app.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white shadow-2xs leading-none">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold mt-1.5 text-center truncate max-w-[82px] leading-tight ${
                  isDark ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]' : 'text-stone-900 drop-shadow-2xs'
                }`}>
                  {app.name}
                </span>
                <span className={`text-[11px] font-medium truncate max-w-[82px] leading-tight ${
                  isDark ? 'text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : 'text-stone-700'
                }`}>
                  {app.subName}
                </span>
              </button>
            );
          })}

          {/* External Apps (from public/apps.json or custom added) */}
          {installedApps.map(app => {
            const IconComp = ICON_MAP[app.icon] || Globe;
            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-[22%] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-xs squircle`}
                  >
                    <IconComp size={26} />
                  </div>
                  {app.badge && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white shadow-2xs leading-none">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold mt-1.5 text-center truncate max-w-[82px] leading-tight ${
                  isDark ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]' : 'text-stone-900 drop-shadow-2xs'
                }`}>
                  {app.name}
                </span>
                <span className={`text-[11px] font-medium truncate max-w-[82px] leading-tight ${
                  isDark ? 'text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : 'text-stone-700'
                }`}>
                  {app.nameIt || app.subName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Dock: Compact, Sleek Capsule */}
      <div className={`mx-2 py-2.5 px-4 rounded-2xl flex items-center justify-around shadow-xs mb-1 shrink-0 backdrop-blur-md transition-colors ${
        isDark ? 'bg-stone-900/80 border border-stone-700/80' : 'bg-[#f8f1e7]/85 border border-amber-900/15'
      }`}>
        <button
          onClick={() => openApp('phone')}
          title="电话 (Telefono)"
          className="w-13 h-13 rounded-[20%] bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-xs squircle active:scale-95 transition-transform"
        >
          <Phone size={24} />
        </button>

        <button
          onClick={() => openApp('notes')}
          title="便签 (Note)"
          className="w-13 h-13 rounded-[20%] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs squircle active:scale-95 transition-transform"
        >
          <FileText size={24} />
        </button>

        <button
          onClick={() => openApp('browser')}
          title="浏览器 (Browser)"
          className="w-13 h-13 rounded-[20%] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs squircle active:scale-95 transition-transform"
        >
          <Compass size={24} />
        </button>

        <button
          onClick={() => openApp('camera')}
          title="相机 (Fotocamera)"
          className="w-13 h-13 rounded-[20%] bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-xs squircle active:scale-95 transition-transform"
        >
          <Camera size={24} />
        </button>
      </div>
    </div>
  );
};
