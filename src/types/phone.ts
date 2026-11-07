export type Language = 'zh' | 'bilingual' | 'it';

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: '工作' | '生活' | '灵感' | '备忘' | '学习';
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tag: '会议' | '纪念日' | '行程' | '待办' | '生活';
  color: string;
  notes?: string;
}

export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: 'markdown' | 'javascript' | 'html' | 'json' | 'text';
  updatedAt: string;
}

export interface ExternalApp {
  id: string;
  name: string;
  nameIt?: string; // Nome dell'applicazione in italiano
  subName: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  url: string;
  displayMode: 'iframe' | 'popup';
  badge?: string;
  isPreinstalled?: boolean;
  isCustom?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  date: string;
  location: string;
  filter?: string;
  isUserPhoto?: boolean;
}

export interface SettingsState {
  language: Language;
  theme: 'dark' | 'light';
  wallpaper: string;
  volume: number;
  brightness: number;
  wifi: boolean;
  bluetooth: boolean;
  cellular: boolean;
  flashlight: boolean;
  dnd: boolean;
  soundEffects: boolean;
  phoneFrame: boolean;
  deviceModel: string;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  name: string;
  notesCount: number;
  eventsCount: number;
  filesCount: number;
  appsCount: number;
}

export interface PhoneBackupData {
  version: string;
  exportedAt: string;
  deviceName: string;
  notes: Note[];
  calendarEvents: CalendarEvent[];
  editorFiles: EditorFile[];
  installedApps: ExternalApp[];
  photos: Photo[];
  settings: SettingsState;
  snapshots: Snapshot[];
}

export type BuiltInAppId =
  | 'notes'
  | 'calendar'
  | 'editor'
  | 'calculator'
  | 'gallery'
  | 'camera'
  | 'clock'
  | 'market'
  | 'settings'
  | 'phone'
  | 'browser';

export interface AppDefinition {
  id: BuiltInAppId | string;
  name: string;
  nameIt?: string;
  subName: string;
  icon: string;
  gradient: string;
  badge?: string;
  isBuiltIn: boolean;
  externalApp?: ExternalApp;
}
