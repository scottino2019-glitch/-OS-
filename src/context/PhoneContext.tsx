import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Note,
  CalendarEvent,
  EditorFile,
  Photo,
  SettingsState,
  ExternalApp,
  Snapshot,
  PhoneBackupData,
  BuiltInAppId,
  Language
} from '../types/phone';
import {
  INITIAL_NOTES,
  INITIAL_EVENTS,
  INITIAL_EDITOR_FILES,
  INITIAL_PHOTOS,
  INITIAL_SETTINGS
} from '../data/defaults';
import { sound } from '../utils/sound';

interface PhoneContextType {
  // Time & System
  currentTime: Date;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;

  // Window & Navigation
  activeAppId: string | null;
  openApp: (appId: string) => void;
  closeApp: () => void;
  recentApps: string[];
  killApp: (appId: string) => void;
  clearAllRecentApps: () => void;
  isMultitaskOpen: boolean;
  setMultitaskOpen: (open: boolean) => void;
  isControlCenterOpen: boolean;
  setControlCenterOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;

  // Data collections
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  editorFiles: EditorFile[];
  addEditorFile: (file: Omit<EditorFile, 'id' | 'updatedAt'>) => void;
  updateEditorFile: (id: string, updates: Partial<EditorFile>) => void;
  deleteEditorFile: (id: string) => void;

  photos: Photo[];
  addPhoto: (photo: Omit<Photo, 'id' | 'date'>) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;

  // Apps & Public link integration
  installedApps: ExternalApp[];
  addCustomApp: (app: Omit<ExternalApp, 'id' | 'isCustom'>) => void;
  removeApp: (id: string) => void;
  reloadPublicApps: () => Promise<number>;

  // Settings
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;

  // Local Backup System
  snapshots: Snapshot[];
  createSnapshot: (name?: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  exportBackup: () => void;
  importBackup: (backupData: PhoneBackupData) => { success: boolean; message: string };
  factoryReset: () => void;

  // Translation helper
  t: (zh: string, it?: string) => string;
}

const PhoneContext = createContext<PhoneContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NOTES: 'huazhi_phone_notes_v1',
  EVENTS: 'huazhi_phone_events_v1',
  FILES: 'huazhi_phone_files_v1',
  PHOTOS: 'huazhi_phone_photos_v1',
  APPS: 'huazhi_phone_apps_v1',
  SETTINGS: 'huazhi_phone_settings_v1',
  SNAPSHOTS: 'huazhi_phone_snapshots_v1'
};

export const PhoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current live time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System states
  const [isLocked, setIsLocked] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [recentApps, setRecentApps] = useState<string[]>(['notes', 'calculator']);
  const [isMultitaskOpen, setMultitaskOpen] = useState(false);
  const [isControlCenterOpen, setControlCenterOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    sound.playTap();
    setTimeout(() => {
      setToast(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Load Initial Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validIds = ['bamboo_parchment', 'bamboo_porcelain', 'bamboo_jade', 'bamboo_lacquer', 'bamboo_crimson'];
        if (parsed.wallpaper === 'parchment_pictogram' || !validIds.includes(parsed.wallpaper)) {
          parsed.wallpaper = 'bamboo_parchment';
        }
        return { ...INITIAL_SETTINGS, ...parsed };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      sound.enabled = settings.soundEffects;
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    sound.playTap();
  }, []);

  // Notes
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save notes', e);
    }
  }, [notes]);

  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: timeStr,
      updatedAt: timeStr
    };
    setNotes(prev => [newNote, ...prev]);
    sound.playSuccess();
    showToast('便签已保存 (Nota Salvata)');
  }, [showToast]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updates, updatedAt: timeStr } : n))
    );
    sound.playTap();
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    sound.playTap();
    showToast('便签已移入废纸篓');
  }, [showToast]);

  // Calendar
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(calendarEvents));
    } catch (e) {
      console.warn('Failed to save events', e);
    }
  }, [calendarEvents]);

  const addCalendarEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...eventData,
      id: `evt_${Date.now()}`
    };
    setCalendarEvents(prev => [...prev, newEvt]);
    sound.playSuccess();
    showToast('日程已加入日历 (Evento Aggiunto)');
  }, [showToast]);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    sound.playTap();
    showToast('日程已删除 (Evento Rimosso)');
  }, [showToast]);

  // Editor files
  const [editorFiles, setEditorFiles] = useState<EditorFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILES);
      return saved ? JSON.parse(saved) : INITIAL_EDITOR_FILES;
    } catch {
      return INITIAL_EDITOR_FILES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(editorFiles));
    } catch (e) {
      console.warn('Failed to save editor files', e);
    }
  }, [editorFiles]);

  const addEditorFile = useCallback((fileData: Omit<EditorFile, 'id' | 'updatedAt'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newFile: EditorFile = {
      ...fileData,
      id: `file_${Date.now()}`,
      updatedAt: timeStr
    };
    setEditorFiles(prev => [newFile, ...prev]);
    sound.playSuccess();
    showToast(`文件 ${newFile.name} 已创建`);
  }, [showToast]);

  const updateEditorFile = useCallback((id: string, updates: Partial<EditorFile>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEditorFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates, updatedAt: timeStr } : f))
    );
  }, []);

  const deleteEditorFile = useCallback((id: string) => {
    setEditorFiles(prev => prev.filter(f => f.id !== id));
    sound.playTap();
    showToast('文件已删除');
  }, [showToast]);

  // Photos
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.warn('Failed to save photos', e);
    }
  }, [photos]);

  const addPhoto = useCallback((photoData: Omit<Photo, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newPhoto: Photo = {
      ...photoData,
      id: `photo_${Date.now()}`,
      date: dateStr
    };
    setPhotos(prev => [newPhoto, ...prev]);
    sound.playShutter();
    showToast('已存入手机相册 (Foto Salvata)');
  }, [showToast]);

  const updatePhoto = useCallback((id: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    sound.playSuccess();
    showToast('照片已更新 (Foto Modificata)');
  }, [showToast]);

  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    sound.playTap();
    showToast('照片已移至回收站');
  }, [showToast]);

  // Installed & Public Apps
  const [installedApps, setInstalledApps] = useState<ExternalApp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Function to load from /public/apps.json
  const reloadPublicApps = useCallback(async (): Promise<number> => {
    try {
      const res = await fetch('/apps.json?t=' + Date.now());
      if (!res.ok) {
        throw new Error('Could not fetch apps.json');
      }
      const data: any[] = await res.json();
      if (Array.isArray(data)) {
        const GRADIENTS = [
          'from-amber-400 via-orange-500 to-rose-500',
          'from-emerald-400 via-teal-500 to-cyan-600',
          'from-violet-500 via-purple-500 to-indigo-600',
          'from-cyan-400 via-blue-500 to-indigo-700',
          'from-pink-500 via-rose-500 to-red-600',
          'from-blue-500 via-indigo-600 to-purple-600'
        ];
        const ICONS = ['Globe', 'Sparkles', 'Gamepad2', 'Palette', 'BookOpen', 'Compass', 'Code'];

        // Normalize both simple format ({ name, url }) and advanced format with Italian name ({ name, nameIt, url })
        const normalizedApps: ExternalApp[] = data
          .filter(item => item && item.url)
          .map((item, idx) => {
            const italianName = item.nameIt || item.name_it || item.nome_it || item.nomeIt;
            return {
              id: item.id || `app_pub_${idx}_${String(item.name || 'app').replace(/\s+/g, '_')}`,
              name: item.name || '外部应用',
              nameIt: italianName || undefined,
              subName: item.subName || italianName || 'Web App',
              description: item.description || (italianName ? `App: ${italianName}` : '来自 public/apps.json'),
              category: item.category || '工具',
              icon: item.icon || ICONS[idx % ICONS.length],
              gradient: item.gradient || GRADIENTS[idx % GRADIENTS.length],
              url: item.url,
              displayMode: item.displayMode || 'iframe',
              badge: item.badge,
              isPreinstalled: true
            };
          });

        setInstalledApps(prev => {
          // Merge: keep custom user-added apps, refresh/update public apps from apps.json
          const customApps = prev.filter(a => a.isCustom);
          const merged = [...normalizedApps, ...customApps];
          try {
            localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
        showToast(`已从 public/apps.json 同步 ${normalizedApps.length} 个应用`);
        return normalizedApps.length;
      }
    } catch (err) {
      console.warn('Failed loading apps.json', err);
    }
    return 0;
  }, [showToast]);

  // Initial load from public/apps.json on mount
  useEffect(() => {
    reloadPublicApps();
  }, [reloadPublicApps]);

  const addCustomApp = useCallback((appData: Omit<ExternalApp, 'id' | 'isCustom'>) => {
    const newApp: ExternalApp = {
      ...appData,
      id: `app_custom_${Date.now()}`,
      isCustom: true
    };
    setInstalledApps(prev => {
      const updated = [...prev, newApp];
      try {
        localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    sound.playSuccess();
    showToast(`应用「${newApp.name}」已安装到桌面`);
  }, [showToast]);

  const removeApp = useCallback((id: string) => {
    setInstalledApps(prev => {
      const updated = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    sound.playTap();
    showToast('应用已卸载 (App Disinstallata)');
  }, [showToast]);

  // Snapshots & Backups
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    } catch (e) {
      console.warn('Failed to save snapshots', e);
    }
  }, [snapshots]);

  const createSnapshot = useCallback((name?: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newSnapshot: Snapshot = {
      id: `snap_${Date.now()}`,
      timestamp: timeStr,
      name: name || `系统即时快照 · ${timeStr}`,
      notesCount: notes.length,
      eventsCount: calendarEvents.length,
      filesCount: editorFiles.length,
      appsCount: installedApps.length
    };
    // Also save payload into local storage under snapshot id
    const payload: PhoneBackupData = {
      version: '1.0.0',
      exportedAt: timeStr,
      deviceName: settings.deviceModel,
      notes,
      calendarEvents,
      editorFiles,
      installedApps,
      photos,
      settings,
      snapshots: []
    };
    try {
      localStorage.setItem(`snap_data_${newSnapshot.id}`, JSON.stringify(payload));
      setSnapshots(prev => [newSnapshot, ...prev]);
      sound.playSuccess();
      showToast('本地快照已生成 (Snapshot Creato)');
    } catch (e) {
      console.error(e);
      showToast('创建快照失败：存储空间不足');
    }
  }, [notes, calendarEvents, editorFiles, installedApps, photos, settings, showToast]);

  const restoreSnapshot = useCallback((snapshotId: string) => {
    try {
      const dataStr = localStorage.getItem(`snap_data_${snapshotId}`);
      if (!dataStr) {
        showToast('找不到该快照数据');
        return;
      }
      const data: PhoneBackupData = JSON.parse(dataStr);
      if (data.notes) setNotes(data.notes);
      if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
      if (data.editorFiles) setEditorFiles(data.editorFiles);
      if (data.installedApps) setInstalledApps(data.installedApps);
      if (data.photos) setPhotos(data.photos);
      if (data.settings) setSettings(data.settings);
      sound.playSuccess();
      showToast('已成功恢复至指定快照 (Snapshot Ripristinato)');
    } catch {
      showToast('恢复快照失败');
    }
  }, [showToast]);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    localStorage.removeItem(`snap_data_${snapshotId}`);
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
    sound.playTap();
    showToast('快照记录已清除');
  }, [showToast]);

  // Export full JSON backup
  const exportBackup = useCallback(() => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const backup: PhoneBackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      deviceName: settings.deviceModel,
      notes,
      calendarEvents,
      editorFiles,
      installedApps,
      photos,
      settings,
      snapshots
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HuaZhi_Phone_Backup_${timeStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    sound.playSuccess();
    showToast('备份文件已导出至本地 (Backup Esportato)');
  }, [notes, calendarEvents, editorFiles, installedApps, photos, settings, snapshots, showToast]);

  // Import full JSON backup
  const importBackup = useCallback((data: PhoneBackupData): { success: boolean; message: string } => {
    try {
      if (!data || typeof data !== 'object') {
        return { success: false, message: '无效的备份文件结构 (File non valido)' };
      }

      if (Array.isArray(data.notes)) {
        setNotes(data.notes);
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
      }
      if (Array.isArray(data.calendarEvents)) {
        setCalendarEvents(data.calendarEvents);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.calendarEvents));
      }
      if (Array.isArray(data.editorFiles)) {
        setEditorFiles(data.editorFiles);
        localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(data.editorFiles));
      }
      if (Array.isArray(data.installedApps)) {
        setInstalledApps(data.installedApps);
        localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(data.installedApps));
      }
      if (Array.isArray(data.photos)) {
        setPhotos(data.photos);
        localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(data.photos));
      }
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...INITIAL_SETTINGS, ...data.settings }));
      }
      if (Array.isArray(data.snapshots)) {
        setSnapshots(data.snapshots);
        localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(data.snapshots));
      }

      sound.playSuccess();
      showToast('备份恢复成功！全部数据已就绪 (Ripristino Riuscito)');
      return { success: true, message: '备份恢复成功！' };
    } catch (err) {
      console.error(err);
      return { success: false, message: '恢复过程中发生错误' };
    }
  }, [showToast]);

  // Factory reset
  const factoryReset = useCallback(() => {
    localStorage.clear();
    setNotes(INITIAL_NOTES);
    setCalendarEvents(INITIAL_EVENTS);
    setEditorFiles(INITIAL_EDITOR_FILES);
    setPhotos(INITIAL_PHOTOS);
    setSettings(INITIAL_SETTINGS);
    setSnapshots([]);
    setActiveAppId(null);
    reloadPublicApps();
    sound.playTap();
    showToast('已恢复出厂设置 (Ripristino alle impostazioni di fabbrica)');
  }, [reloadPublicApps, showToast]);

  // App Navigation
  const openApp = useCallback((appId: string) => {
    sound.playTap();
    setActiveAppId(appId);
    setRecentApps(prev => [appId, ...prev.filter(id => id !== appId)].slice(0, 8));
    setMultitaskOpen(false);
    setControlCenterOpen(false);
    setNotificationOpen(false);
  }, []);

  const closeApp = useCallback(() => {
    sound.playTap();
    setActiveAppId(null);
  }, []);

  const killApp = useCallback((appId: string) => {
    sound.playTap();
    setRecentApps(prev => prev.filter(id => id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
  }, [activeAppId]);

  const clearAllRecentApps = useCallback(() => {
    sound.playTap();
    setRecentApps([]);
    setActiveAppId(null);
    setMultitaskOpen(false);
    showToast('已清理后台，释放 3.6 GB 运行内存');
  }, [showToast]);

  // Translation helper (supports Chinese, Bilingual with Italian subtitle, or Italian)
  const t = useCallback((zh: string, it?: string): string => {
    if (settings.language === 'it') {
      return it || zh;
    }
    if (settings.language === 'bilingual' && it) {
      return `${zh} (${it})`;
    }
    return zh;
  }, [settings.language]);

  return (
    <PhoneContext.Provider
      value={{
        currentTime,
        isLocked,
        setLocked: setIsLocked,
        toast,
        showToast,
        activeAppId,
        openApp,
        closeApp,
        recentApps,
        killApp,
        clearAllRecentApps,
        isMultitaskOpen,
        setMultitaskOpen,
        isControlCenterOpen,
        setControlCenterOpen,
        isNotificationOpen,
        setNotificationOpen,
        notes,
        addNote,
        updateNote,
        deleteNote,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        editorFiles,
        addEditorFile,
        updateEditorFile,
        deleteEditorFile,
        photos,
        addPhoto,
        updatePhoto,
        deletePhoto,
        installedApps,
        addCustomApp,
        removeApp,
        reloadPublicApps,
        settings,
        updateSettings,
        snapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        exportBackup,
        importBackup,
        factoryReset,
        t
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
};

export const usePhone = () => {
  const context = useContext(PhoneContext);
  if (!context) {
    throw new Error('usePhone must be used within a PhoneProvider');
  }
  return context;
};
