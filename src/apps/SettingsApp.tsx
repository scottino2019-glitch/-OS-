import React, { useRef, useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { INITIAL_WALLPAPERS } from '../data/defaults';
import { PhoneBackupData } from '../types/phone';
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  Smartphone,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  History,
  Trash2,
  Volume2,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    notes,
    calendarEvents,
    editorFiles,
    photos,
    installedApps,
    snapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportBackup,
    importBackup,
    factoryReset,
    t,
    showToast
  } = usePhone();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json: PhoneBackupData = JSON.parse(reader.result as string);
        const res = importBackup(json);
        if (!res.success) {
          showToast(res.message);
        }
      } catch (err) {
        showToast('备份文件解析失败，请检查是否为合法 JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalItems = notes.length + calendarEvents.length + editorFiles.length + photos.length + installedApps.length;
  const simulatedUsedMb = (12.4 + photos.length * 2.1 + notes.length * 0.05).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Settings Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-indigo-600" />
          <span>{t('系统设置与本地备份', 'Impostazioni & Backup')}</span>
        </h1>
        <p className="text-xs text-slate-500">
          {t('个性化外观、语言与一键本地备份恢复', 'Configurazione, Sfondi & Ripristino')}
        </p>
      </div>

      {/* Main Settings List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 slim-scrollbar">
        {/* Section 1: Backup & Restore */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <HardDrive size={20} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {t('一键本地备份与恢复', 'Backup Locale & Ripristino')}
              </h3>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 px-2.5 py-0.5 rounded-full">
              无需服务器
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t(
              '所有便签、日程、代码文件、自定外部应用与壁纸均可在本地即时导出为 JSON 备份文件，随时一键恢复。',
              'Esporta tutti i dati in un file JSON locale e ripristina all\'istante senza cloud.'
            )}
          </p>

          {/* Backup Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={exportBackup}
              className="flex items-center justify-center gap-2 py-3 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Download size={16} />
              <span>{t('导出完整备份', 'Esporta Backup')}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all active:scale-95"
            >
              <Upload size={16} />
              <span>{t('恢复备份文件', 'Ripristina File')}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Snapshots row */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History size={15} className="text-amber-600" />
                <span>{t('本地即时快照 (Snapshot)', 'Punti di Ripristino')}</span>
              </span>
              <button
                onClick={() => createSnapshot()}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + {t('创建当前快照', 'Crea Nuovo')}
              </button>
            </div>

            {snapshots.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                {t('暂无本地快照，点击上方可保存当前状态点', 'Nessuno snapshot salvato')}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto slim-scrollbar">
                {snapshots.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200"
                  >
                    <div>
                      <div className="text-slate-900 font-bold">{s.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.notesCount} 便签 · {s.eventsCount} 日程 · {s.filesCount} 文件
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreSnapshot(s.id)}
                        className="px-2.5 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-lg text-xs"
                      >
                        {t('恢复', 'Carica')}
                      </button>
                      <button
                        onClick={() => deleteSnapshot(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Appearance & Wallpapers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <span>{t('壁纸与显示风格', 'Sfondi & Tema')}</span>
          </h3>

          <div className="grid grid-cols-5 gap-1.5">
            {INITIAL_WALLPAPERS.map(wp => {
              const theme = (wp as any).theme || 'parchment';
              const stalkColor =
                theme === 'porcelain' ? '#1d4ed8' :
                theme === 'jade' ? '#047857' :
                theme === 'lacquer' ? '#eab308' :
                theme === 'crimson' ? '#fef08a' : '#1c1917';

              const sealColor =
                theme === 'porcelain' ? '#2563eb' :
                theme === 'crimson' ? '#f59e0b' : '#B92B27';

              return (
                <button
                  key={wp.id}
                  onClick={() => updateSettings({ wallpaper: wp.id })}
                  style={{ background: wp.preview }}
                  className={`h-16 rounded-xl relative overflow-hidden transition-all border flex flex-col justify-between p-1 cursor-pointer ${
                    settings.wallpaper === wp.id
                      ? 'ring-3 ring-red-600 border-red-500 scale-105 shadow-md'
                      : 'border-slate-300/80 opacity-85 hover:opacity-100 hover:border-slate-500'
                  }`}
                  title={wp.name}
                >
                  {/* Thematic mini bamboo ink preview */}
                  <svg viewBox="0 0 40 40" className="w-full h-8 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 16,38 Q 14,20 18,5" stroke={stalkColor} strokeWidth="2.8" fill="none" strokeLinecap="round" />
                    <ellipse cx="16" cy="22" rx="3" ry="1.2" fill={stalkColor} />
                    <path d="M 16,22 Q 7,18 2,24 Q 9,21 16,22 Z" fill={stalkColor} />
                    <path d="M 16,22 Q 25,17 32,22 Q 24,20 16,22 Z" fill={stalkColor} />
                    {/* Mini traditional seal */}
                    <rect x="25" y="2" width="11" height="11" fill={sealColor} rx="1.5" />
                    <text x="30.5" y="9.5" fontSize="6.5" fill="#fff" fontFamily="serif" textAnchor="middle" fontWeight="bold">竹</text>
                  </svg>

                  <div className={`text-[10px] font-bold truncate w-full text-center rounded py-0.5 ${
                    theme === 'lacquer' || theme === 'crimson' ? 'bg-black/70 text-white' : 'bg-white/90 text-slate-950'
                  }`}>
                    {wp.name.split(' ')[0]}
                  </div>

                  {settings.wallpaper === wp.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xs">
                      <Check size={11} className="font-bold stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-600 font-medium pt-1">
            {t('当前壁纸: ', 'Sfondo attuale: ')}
            <span className="font-bold text-red-700 ml-1">
              {INITIAL_WALLPAPERS.find(w => w.id === settings.wallpaper)?.name || settings.wallpaper}
            </span>
          </div>

          {/* Theme mode and Frame switch */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-800 font-bold transition-colors"
            >
              {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} className="text-amber-500" />}
              <span>{settings.theme === 'dark' ? '深色模式 (Dark)' : '浅色模式 (Light)'}</span>
            </button>

            <button
              onClick={() => updateSettings({ phoneFrame: !settings.phoneFrame })}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-colors font-bold ${
                settings.phoneFrame ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Smartphone size={16} />
              <span>{settings.phoneFrame ? '机身外框: 开启' : '全屏无框模式'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Language */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-emerald-600" />
            <span>{t('语言模式与字幕', 'Lingua & Sottotitoli')}</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => updateSettings({ language: 'zh' })}
              className={`py-2 px-2 rounded-xl border text-center transition-all ${
                settings.language === 'zh'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              中文沉浸
            </button>
            <button
              onClick={() => updateSettings({ language: 'bilingual' })}
              className={`py-2 px-2 rounded-xl border text-center transition-all ${
                settings.language === 'bilingual'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              中意双语 (Consigliato)
            </button>
            <button
              onClick={() => updateSettings({ language: 'it' })}
              className={`py-2 px-2 rounded-xl border text-center transition-all ${
                settings.language === 'it'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Italiano
            </button>
          </div>
        </div>

        {/* Section 4: Sound & Touch */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Volume2 size={18} className="text-sky-600" />
            <span>{t('系统音效与触感', 'Suoni & Feedback')}</span>
          </h3>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-800 font-semibold">{t('按键音与系统音效', 'Effetti sonori Web Audio')}</span>
            <button
              onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundEffects ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 5: About Phone & Factory Reset */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Info size={18} className="text-purple-600" />
            <span>{t('关于极光手机', 'Info sul Telefono')}</span>
          </h3>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">设备型号 (Modello)</span>
            <span className="text-slate-900 font-bold">{settings.deviceModel}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">系统版本 (Versione OS)</span>
            <span className="text-slate-900 font-bold">极光OS 4.2 明亮流光版</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">本地已存项目 (Dati)</span>
            <span className="text-slate-900 font-bold">{totalItems} 项数据 ({simulatedUsedMb} MB)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">网络与基带</span>
            <span className="text-emerald-700 font-bold">双卡 5G+ 全网通</span>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {showResetConfirm ? (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertTriangle size={16} />
                  <span>确定要恢复出厂设置吗？</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  这将清除所有本地保存的便签、日程与自定应用。请先导出备份！
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 rounded-lg text-slate-700 font-bold text-xs"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      factoryReset();
                      setShowResetConfirm(false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                  >
                    确定清除并重置
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-colors text-xs"
              >
                {t('恢复出厂设置', 'Ripristino alle impostazioni di fabbrica')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
