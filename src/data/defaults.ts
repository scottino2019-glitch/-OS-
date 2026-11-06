import { Note, CalendarEvent, EditorFile, Photo, SettingsState, ExternalApp } from '../types/phone';

export const INITIAL_WALLPAPERS = [
  {
    id: 'bamboo_parchment',
    name: '清竹古卷 (Pergamena & Inchiostro)',
    preview: 'linear-gradient(135deg, #e8dac0 0%, #dfcaa5 50%, #d5bd94 100%)',
    bgStyle: 'bg-[#dfcaa5] text-stone-900',
    theme: 'parchment'
  },
  {
    id: 'bamboo_porcelain',
    name: '青花瓷竹 (Porcellana Ming Blu/Bianco)',
    preview: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)',
    bgStyle: 'bg-[#f8fafc] text-slate-900',
    theme: 'porcelain'
  },
  {
    id: 'bamboo_jade',
    name: '青玉翡翠 (Giada Imperiale & Smeraldo)',
    preview: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    bgStyle: 'bg-[#e6f4ea] text-emerald-950',
    theme: 'jade'
  },
  {
    id: 'bamboo_lacquer',
    name: '玄漆金竹 (Lacca Nera & Oro)',
    preview: 'linear-gradient(135deg, #242220 0%, #131110 50%, #000000 100%)',
    bgStyle: 'bg-[#141210] text-amber-100',
    theme: 'lacquer'
  },
  {
    id: 'bamboo_crimson',
    name: '朱红锦绣 (Rosso Dinastico)',
    preview: 'linear-gradient(135deg, #a8201a 0%, #851812 50%, #5c0f0a 100%)',
    bgStyle: 'bg-[#7a140f] text-amber-50',
    theme: 'crimson'
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note_1',
    title: '欢迎使用极光手机 · 中国红限定版',
    content: `欢迎体验极光OS虚拟手机（中国红典藏款）！
Benvenuto nello smartphone virtuale Aurora OS (Edizione Rosso Imperiale).

【特色亮点】
1. 专属定制外观：
   - 珍珠灰矩阵浮水印点阵背景（印有“中国”篆体水纹）
   - 中国红金属质感旗舰机身
   - 古卷金文与甲骨文羊皮纸壁纸，温润沉稳
2. 模块化应用扩展：
   - 只需在 /public/apps.json 写入 {"name": "应用名", "url": "网址"}，即可自动在手机上安装运行。
3. 经典内置应用：
   - 便签本、日历节气、轻编辑器、换算计算器、相册与时钟。
4. 本地即时安全备份：
   - 一键无损导出与恢复 JSON 备份。`,
    tag: '备忘',
    color: '#dc2626',
    isPinned: true,
    createdAt: '2026-11-05 08:00',
    updatedAt: '2026-11-05 08:30'
  },
  {
    id: 'note_2',
    title: '生鲜超市采买清单 (Lista Spesa)',
    content: `- 新鲜龙井绿茶 (Tè Verde)
- 金华火腿一片 (Prosciutto Jinhua)
- 现磨黑芝麻糊 (Crema di sesamo nero)
- 泰国金枕榴莲 (Durian)
- 有机小青菜与香菇 (Verdure fresche)`,
    tag: '生活',
    color: '#10b981',
    isPinned: false,
    createdAt: '2026-11-04 17:15',
    updatedAt: '2026-11-04 18:20'
  },
  {
    id: 'note_3',
    title: '产品设计与灵感 (Idee di Design)',
    content: `传统华夏美学与现代科技结合：
- 琉璃中国红机身
- 甲骨古卷图腾与朱砂印章
- 底部三键快速导航：返回、主页、任务
- 本地一键无损备份`,
    tag: '灵感',
    color: '#b91c1c',
    isPinned: false,
    createdAt: '2026-11-03 14:00',
    updatedAt: '2026-11-03 15:45'
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: '立冬节气 · 围炉煮茶',
    date: '2026-11-07',
    time: '15:00',
    tag: '生活',
    color: '#b91c1c',
    notes: '二十四节气之立冬，煮老白茶与烤橘子'
  },
  {
    id: 'evt_2',
    title: '技术同步会 (Meeting)',
    date: '2026-11-05',
    time: '10:30',
    tag: '会议',
    color: '#3b82f6',
    notes: '讨论 /public/apps.json 自动热加载机制'
  },
  {
    id: 'evt_3',
    title: '手机数据本地安全快照检查',
    date: '2026-11-08',
    time: '20:00',
    tag: '待办',
    color: '#f59e0b',
    notes: '导出一次全量 JSON 备份到本地存档'
  }
];

export const INITIAL_EDITOR_FILES: EditorFile[] = [
  {
    id: 'file_1',
    name: 'README.md',
    language: 'markdown',
    content: `# 极光OS · 开发者说明 (Developer Readme)

本项目是一个运行在纯前端的**虚拟中国智能手机操作系统**。

## 特色机制
1. **零服务端依赖**：所有的便签、日历、文件、照片与系统设置均保存在本地浏览器 LocalStorage。
2. **外部应用极简配置**：放入 \`/public/apps.json\` 仅需 {"name": "...", "url": "..."} 即可自动加载！
3. **极速本地备份**：随时一键导出与恢复 JSON 文件。
`,
    updatedAt: '2026-11-05 08:15'
  },
  {
    id: 'file_2',
    name: 'config.js',
    language: 'javascript',
    content: `// 极光手机系统配置文件
export const PhoneConfig = {
  osName: "极光OS",
  edition: "中国红限定典藏版",
  chassisColor: "Cinnabar Crimson Red",
  wallpaper: "Antique Parchment Pictogram",
  isDualSim5G: true
};
`,
    updatedAt: '2026-11-04 19:20'
  }
];

export const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'photo_1',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
    title: '上海外滩夜色 (Shanghai)',
    date: '2026-11-02',
    location: '上海 · 外滩',
    filter: '赛博夜景'
  },
  {
    id: 'photo_2',
    url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=800&q=80',
    title: '故宫红墙白雪 (Forbidden City)',
    date: '2026-10-28',
    location: '北京 · 故宫博物院',
    filter: '经典国风'
  },
  {
    id: 'photo_3',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    title: '江南水乡晨雾 (Water Town)',
    date: '2026-10-15',
    location: '浙江 · 乌镇',
    filter: '清流水墨'
  }
];

export const INITIAL_SETTINGS: SettingsState = {
  language: 'bilingual',
  theme: 'light',
  wallpaper: 'bamboo_parchment', // Authentic Chinese ink bamboo on antique parchment
  volume: 78,
  brightness: 90,
  wifi: true,
  bluetooth: true,
  cellular: true,
  flashlight: false,
  dnd: false,
  soundEffects: true,
  phoneFrame: true,
  deviceModel: '极光 16 Pro · 琉璃中国红'
};
