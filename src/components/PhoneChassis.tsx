import React, { useState, useEffect, useCallback } from 'react';
import { usePhone } from '../context/PhoneContext';
import { StatusBar } from './StatusBar';
import { ControlCenter } from './ControlCenter';
import { NotificationCenter } from './NotificationCenter';
import { MultitaskView } from './MultitaskView';
import { HomeScreen } from './HomeScreen';
import { NotesApp } from '../apps/NotesApp';
import { CalendarApp } from '../apps/CalendarApp';
import { EditorApp } from '../apps/EditorApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { GalleryApp } from '../apps/GalleryApp';
import { ClockApp } from '../apps/ClockApp';
import { AppMarketApp } from '../apps/AppMarketApp';
import { SettingsApp } from '../apps/SettingsApp';
import { WebBrowserApp } from '../apps/WebBrowserApp';
import { PhoneDialerApp } from '../apps/PhoneDialerApp';
import { INITIAL_WALLPAPERS } from '../data/defaults';
import { BambooParchmentWallpaper } from './BambooParchmentWallpaper';
import { sound } from '../utils/sound';
import {
  Volume2,
  RefreshCw,
  Download,
  Smartphone,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Home,
  Square,
  Circle
} from 'lucide-react';

const APP_TITLES: Record<string, string> = {
  notes: '便签 (Note)',
  calendar: '日历 (Calendario)',
  editor: '轻编辑 (Editor)',
  calculator: '计算与换算 (Calcolo)',
  gallery: '相册 (Galleria)',
  camera: '相机 (Fotocamera)',
  clock: '时钟 (Orologio)',
  market: '应用市场 (App Store)',
  settings: '系统设置 (Impostazioni)',
  phone: '电话 (Telefono)',
  browser: '浏览器 (Browser)'
};

export const PhoneChassis: React.FC = () => {
  const {
    activeAppId,
    closeApp,
    isLocked,
    setLocked,
    toast,
    settings,
    updateSettings,
    isMultitaskOpen,
    setMultitaskOpen,
    installedApps,
    exportBackup,
    reloadPublicApps,
    t
  } = usePhone();

  const [showVolumeHud, setShowVolumeHud] = useState(false);
  // Header collapsed by default as requested: "riduci a scomparsa l'header sopra e dai spazio al telefono"
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  // Auto-fit calculation: calculates a fit scale so the phone is 100% fully visible without clipping the bottom
  const calculateAutoFitScale = useCallback(() => {
    if (typeof window === 'undefined') return 0.85;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    // Available space excluding header (54px) and page margins (24px)
    const availH = vh - 78;
    const availW = vw - 24;
    const scaleH = availH / 740;
    const scaleW = availW / 392;
    const fitScale = Math.min(1.0, scaleH, scaleW);
    // Allow scaling down to 0.40 so even in very short windows the whole phone is completely visible
    return Math.max(0.40, Math.min(1.0, Number(fitScale.toFixed(2))));
  }, []);

  // Scale management: initial fit so the entire phone is visible immediately on load
  const [scaleMode, setScaleMode] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scaleH = (vh - 78) / 740;
      const scaleW = (vw - 24) / 392;
      return Math.max(0.40, Math.min(1.0, Number(Math.min(1.0, scaleH, scaleW).toFixed(2))));
    }
    return 0.85;
  });
  const [userZoomSet, setUserZoomSet] = useState<boolean>(false);

  // Auto-fit on window resize unless user explicitly chose a custom zoom
  useEffect(() => {
    const handleResize = () => {
      if (!userZoomSet) {
        setScaleMode(calculateAutoFitScale());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userZoomSet, calculateAutoFitScale]);

  const handleVolumeChange = (delta: number) => {
    sound.playTap();
    const newVol = Math.min(100, Math.max(0, settings.volume + delta));
    updateSettings({ volume: newVol });
    setShowVolumeHud(true);
    setTimeout(() => setShowVolumeHud(false), 1500);
  };

  const handlePowerButton = () => {
    sound.playTap();
    setLocked(!isLocked);
  };

  const currentWp = INITIAL_WALLPAPERS.find(w => w.id === settings.wallpaper);
  // Pass settings.wallpaper directly so theme matching in BambooParchmentWallpaper always triggers properly
  const wallpaperTheme = settings.wallpaper || (currentWp as any)?.theme || 'bamboo_parchment';
  const wallpaperStyle = currentWp ? currentWp.bgStyle : INITIAL_WALLPAPERS[0].bgStyle;

  const isCustomImageWallpaper = settings.wallpaper.startsWith('data:') || settings.wallpaper.startsWith('http');

  const activeExternalApp = installedApps.find(a => a.id === activeAppId);
  const currentAppTitle = activeExternalApp
    ? `${activeExternalApp.name} (${activeExternalApp.subName || 'Web'})`
    : activeAppId
    ? APP_TITLES[activeAppId] || activeAppId
    : '';

  return (
    <div
      className="min-h-screen w-screen text-slate-800 flex flex-col items-center justify-between p-1 sm:p-2 overflow-y-auto overflow-x-hidden select-none relative"
      style={{
        backgroundColor: '#d8dee6',
        backgroundImage: `
          radial-gradient(#94a3b8 1.5px, transparent 1.5px),
          radial-gradient(#94a3b8 1.5px, #d8dee6 1.5px)
        `,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      }}
    >
      {/* Background Watermark: Grigio Perla with subtle dotted Chinese "中国" watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div
          className="text-[260px] md:text-[340px] font-black tracking-widest text-slate-500/15 select-none font-serif transform -rotate-12 transition-all leading-none"
          style={{
            fontFamily: '"Noto Sans SC", "PingFang SC", "Songti SC", serif',
            textShadow: '0 0 20px rgba(148, 163, 184, 0.25)'
          }}
        >
          中国
        </div>
        <div className="absolute bottom-8 right-12 text-slate-400/30 text-xs font-mono font-bold tracking-[0.3em] uppercase hidden sm:block">
          ZHONGGUO · 39°54'N 116°23'E · CHINESE TECH EMULATOR
        </div>
      </div>

      {/* Top Floating Control Bar - Always Visible, Instant Zoom Controls & Presets */}
      <div className="z-50 shrink-0 w-full max-w-4xl flex justify-center mb-1 px-2">
        <header className="w-full flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-white/95 border border-slate-300 rounded-2xl text-xs text-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span className="font-extrabold text-slate-900 tracking-wide text-xs sm:text-sm">
              极光OS · 旗舰大屏
            </span>
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {Math.round(scaleMode * 100)}%
            </span>
          </div>

          {/* Quick Zoom Presets & Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Presets */}
            <button
              onClick={() => {
                setScaleMode(1.0);
                setUserZoomSet(true);
              }}
              title="Visualizza alla dimensione reale 100% (Grande e leggibile)"
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                scaleMode === 1.0
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              100% (Grande)
            </button>

            <button
              onClick={() => {
                setScaleMode(1.15);
                setUserZoomSet(true);
              }}
              title="Ingrandisci al 115% (Maxi)"
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                scaleMode === 1.15
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              115% (Maxi)
            </button>

            <button
              onClick={() => {
                setScaleMode(calculateAutoFitScale());
                setUserZoomSet(true);
              }}
              title="Adatta l'intero telefono all'altezza della finestra"
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300"
            >
              Adatta
            </button>

            {/* Stepper +/- */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-300 text-xs">
              <button
                onClick={() => {
                  setScaleMode(prev => Math.max(0.40, Number((prev - 0.10).toFixed(2))));
                  setUserZoomSet(true);
                }}
                title="Riduci (-10%)"
                className="px-2 py-1 hover:text-black hover:bg-slate-200 rounded-lg font-bold text-slate-700"
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={() => {
                  setScaleMode(prev => Math.min(1.30, Number((prev + 0.10).toFixed(2))));
                  setUserZoomSet(true);
                }}
                title="Ingrandisci (+10%)"
                className="px-2 py-1 hover:text-black hover:bg-slate-200 rounded-lg font-bold text-slate-700"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              onClick={() => updateSettings({ phoneFrame: !settings.phoneFrame })}
              title="Attiva/Disattiva scocca rossa"
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-300 text-xs font-semibold shadow-2xs"
            >
              <Smartphone size={13} />
              <span className="hidden sm:inline">{settings.phoneFrame ? 'Senza Scocca' : 'Scocca Rossa'}</span>
            </button>

            <button
              onClick={exportBackup}
              title="Esporta backup JSON"
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-xs text-xs"
            >
              <Download size={12} />
              <span>Backup</span>
            </button>
          </div>
        </header>
      </div>

      {/* Main Screen Container - Proportionally Sized Wrapper, ZERO Bottom Clipping */}
      <main className="flex-1 w-full flex flex-col items-center justify-start p-2 pb-12 z-10 overflow-y-auto">
        <div
          className="relative transition-all duration-150 shrink-0 mx-auto"
          style={{
            width: `${392 * scaleMode}px`,
            height: `${740 * scaleMode}px`,
          }}
        >
          <div
            className="origin-top-left transition-transform duration-150 absolute top-0 left-0"
            style={{
              transform: `scale(${scaleMode})`,
              width: '392px',
              height: '740px',
            }}
          >
            {/* Physical Side Buttons on Phone Chassis (Vermilion Red & Gold) */}
            {settings.phoneFrame && (
              <>
                {/* Left side: Volume Rocker */}
                <div className="absolute -left-3.5 top-24 flex flex-col gap-3 z-30 hidden sm:flex">
                  <button
                    onClick={() => handleVolumeChange(10)}
                    title="音量加 (Volume +)"
                    className="w-1.5 h-10 bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 rounded-l-md hover:brightness-110 active:scale-95 transition-transform shadow-md"
                  />
                  <button
                    onClick={() => handleVolumeChange(-10)}
                    title="音量减 (Volume -)"
                    className="w-1.5 h-10 bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 rounded-l-md hover:brightness-110 active:scale-95 transition-transform shadow-md"
                  />
                </div>

                {/* Right side: Power / Lock Button */}
                <div className="absolute -right-3.5 top-28 z-30 hidden sm:flex">
                  <button
                    onClick={handlePowerButton}
                    title="电源键 / 锁屏 (Power / Lock)"
                    className="w-1.5 h-14 bg-gradient-to-l from-red-700 via-rose-600 to-amber-500 rounded-r-md hover:brightness-110 active:scale-95 transition-transform shadow-md"
                  />
                </div>
              </>
            )}

            {/* Smartphone Body - Imperial Vermilion Red Titanium Frame (392px x 740px) */}
            <div
              className={`relative overflow-hidden transition-all duration-300 w-[392px] h-[740px] ${
                settings.phoneFrame
                  ? 'rounded-[46px] ring-7 ring-red-950/95 shadow-[0_24px_70px_rgba(153,27,27,0.48)] border-2 border-red-500/80'
                  : 'rounded-3xl border border-red-700 shadow-xl'
              }`}
            style={{
              backgroundImage: isCustomImageWallpaper ? `url(${settings.wallpaper})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Wallpaper background wrapper */}
            <div
              className={`w-full h-full flex flex-col relative select-none ${
                isCustomImageWallpaper ? 'bg-black/20 backdrop-blur-xs' : wallpaperStyle
              }`}
            >
              {/* Bamboo & Red Seal Artwork in selected theme (Parchment, Porcelain, Jade, Lacquer, Crimson) */}
              {!isCustomImageWallpaper && <BambooParchmentWallpaper theme={wallpaperTheme} />}

              {/* Top Status Bar */}
              <StatusBar />

              {/* In-Screen Volume HUD */}
              {showVolumeHud && (
                <div className="absolute top-12 left-4 z-50 bg-stone-900/90 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2 border border-stone-700 text-white animate-in fade-in">
                  <Volume2 size={18} className="text-amber-400" />
                  <div className="w-20 h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-150"
                      style={{ width: `${settings.volume}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold">{settings.volume}%</span>
                </div>
              )}

              {/* System Toast Banner */}
              {toast && (
                <div className="absolute top-11 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-top-4 duration-200">
                  <div className="bg-stone-900/95 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2 backdrop-blur-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold">{toast}</span>
                  </div>
                </div>
              )}

              {/* Overlays: Control Center & Notification Center */}
              <ControlCenter />
              <NotificationCenter />
              <MultitaskView />

              {/* Screen Content: Lock Screen / Home Screen / Active App */}
              <div className="flex-1 relative overflow-hidden flex flex-col z-10">
                {isLocked ? (
                  <HomeScreen />
                ) : activeAppId ? (
                  /* App Container with Top Navigation Bar */
                  <div className="w-full h-full flex flex-col bg-[#fbf9f4] text-stone-900 animate-in fade-in duration-150">
                    {/* Top App Bar with Clear Back Button */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#ebdcc2] border-b border-amber-900/25 shrink-0 shadow-2xs z-30">
                      <button
                        onClick={closeApp}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-950 hover:text-black hover:bg-stone-300/60 rounded-xl font-bold text-sm sm:text-base transition-colors active:scale-95"
                        title="Torna alla schermata principale"
                      >
                        <ChevronLeft size={22} className="text-red-700 stroke-[3]" />
                        <span>{t('返回主页', 'Indietro (Home)')}</span>
                      </button>

                      <span className="text-sm sm:text-base font-extrabold text-stone-900 truncate max-w-[240px]">
                        {currentAppTitle}
                      </span>

                      <button
                        onClick={closeApp}
                        className="p-2 text-stone-700 hover:text-black hover:bg-stone-300/60 rounded-xl transition-colors active:scale-95"
                        title="Torna alla Home"
                      >
                        <Home size={20} className="text-red-700" />
                      </button>
                    </div>

                    {/* App Content with min-h-0 to guarantee no vertical cut-off */}
                    <div className="flex-1 min-h-0 overflow-hidden relative">
                      {activeAppId === 'notes' && <NotesApp />}
                      {activeAppId === 'calendar' && <CalendarApp />}
                      {activeAppId === 'editor' && <EditorApp />}
                      {activeAppId === 'calculator' && <CalculatorApp />}
                      {activeAppId === 'gallery' && <GalleryApp />}
                      {activeAppId === 'camera' && <GalleryApp />}
                      {activeAppId === 'clock' && <ClockApp />}
                      {activeAppId === 'market' && <AppMarketApp />}
                      {activeAppId === 'settings' && <SettingsApp />}
                      {activeAppId === 'phone' && <PhoneDialerApp />}
                      {activeAppId === 'browser' && <WebBrowserApp />}

                      {activeExternalApp && (
                        <WebBrowserApp
                          initialUrl={activeExternalApp.url}
                          appName={activeExternalApp.name}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <HomeScreen />
                )}
              </div>

              {/* Bottom Navigation Bar - Sleek, Refined, and Compact */}
              <nav className="h-8 w-full bg-[#f4ece1]/90 border-t border-stone-300/70 backdrop-blur-md flex items-center justify-around px-8 z-40 shrink-0 shadow-2xs">
                {/* 1. Back button (◀) */}
                <button
                  onClick={() => {
                    sound.playTap();
                    if (activeAppId) {
                      closeApp();
                    } else if (isMultitaskOpen) {
                      setMultitaskOpen(false);
                    }
                  }}
                  title="返回 (Indietro)"
                  className="w-12 h-6 flex items-center justify-center text-stone-700 hover:text-black hover:bg-stone-200/80 rounded-lg active:scale-90 transition-transform"
                >
                  <ChevronLeft size={18} className="stroke-[2.5]" />
                </button>

                {/* 2. Home button (⚪) */}
                <button
                  onClick={() => {
                    sound.playTap();
                    closeApp();
                    setMultitaskOpen(false);
                  }}
                  title="主屏幕 (Home)"
                  className="w-12 h-6 flex items-center justify-center text-stone-700 hover:text-black hover:bg-stone-200/80 rounded-lg active:scale-90 transition-transform"
                >
                  <Circle size={15} className="stroke-[2.5]" />
                </button>

                {/* 3. Multitask button (▢) */}
                <button
                  onClick={() => {
                    sound.playTap();
                    setMultitaskOpen(!isMultitaskOpen);
                  }}
                  title="多任务后台 (Recenti)"
                  className="w-12 h-6 flex items-center justify-center text-stone-700 hover:text-black hover:bg-stone-200/80 rounded-lg active:scale-90 transition-transform"
                >
                  <Square size={14} className="stroke-[2.5]" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};
