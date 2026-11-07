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

const SVG_SHANGHAI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 960" width="720" height="960">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0f24"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="85%" stop-color="#431407"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="720" height="960" fill="url(#sky1)"/>
  <circle cx="120" cy="100" r="1.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="280" cy="80" r="2" fill="#ffffff" opacity="0.9"/>
  <circle cx="560" cy="140" r="1.8" fill="#fde047" opacity="0.8"/>
  <circle cx="420" cy="60" r="1.2" fill="#ffffff" opacity="0.7"/>
  <path d="M 0,620 L 40,620 L 40,560 L 80,560 L 80,620 L 140,620 L 140,510 L 170,510 L 170,620 L 320,620 L 320,480 L 360,480 L 360,620 L 450,620 L 450,540 L 520,540 L 520,620 L 620,620 L 620,500 L 660,500 L 660,620 L 720,620 L 720,700 L 0,700 Z" fill="#0f172a" opacity="0.8"/>
  <path d="M 500,620 L 525,260 Q 535,210 540,180 Q 545,210 555,260 L 580,620 Z" fill="#1e293b"/>
  <path d="M 525,260 L 540,180 L 555,260 Z" fill="#38bdf8" opacity="0.85"/>
  <line x1="540" y1="180" x2="540" y2="140" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 410,620 L 420,330 L 440,330 L 450,620 Z" fill="#0f172a"/>
  <line x1="240" y1="620" x2="240" y2="160" stroke="#e11d48" stroke-width="4"/>
  <line x1="215" y1="620" x2="235" y2="440" stroke="#f43f5e" stroke-width="6"/>
  <line x1="265" y1="620" x2="245" y2="440" stroke="#f43f5e" stroke-width="6"/>
  <circle cx="240" cy="440" r="48" fill="#e11d48"/>
  <circle cx="230" cy="430" r="42" fill="#fb7185"/>
  <circle cx="225" cy="420" r="16" fill="#ffe4e6"/>
  <circle cx="240" cy="300" r="30" fill="#e11d48"/>
  <circle cx="235" cy="295" r="24" fill="#fb7185"/>
  <circle cx="230" cy="290" r="9" fill="#ffe4e6"/>
  <circle cx="240" cy="205" r="13" fill="#fb7185"/>
  <line x1="240" y1="192" x2="240" y2="110" stroke="#f43f5e" stroke-width="3"/>
  <circle cx="240" cy="110" r="4" fill="#fef08a"/>
  <rect x="0" y="660" width="720" height="300" fill="url(#river)"/>
  <path d="M 210,670 L 270,670 L 255,900 L 225,900 Z" fill="#f43f5e" opacity="0.35"/>
  <path d="M 515,670 L 565,670 L 555,880 L 525,880 Z" fill="#38bdf8" opacity="0.3"/>
  <ellipse cx="240" cy="710" rx="90" ry="4" fill="#fbcfe8" opacity="0.4"/>
  <ellipse cx="240" cy="760" rx="120" ry="5" fill="#f43f5e" opacity="0.3"/>
  <ellipse cx="540" cy="730" rx="70" ry="3" fill="#bae6fd" opacity="0.4"/>
  <ellipse cx="360" cy="820" rx="260" ry="6" fill="#fde047" opacity="0.25"/>
  <rect x="0" y="870" width="720" height="90" fill="#ffffff" opacity="0.96"/>
  <text x="36" y="915" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">AURORA 16 · LEICA 50mm f/1.4 OIS</text>
  <text x="36" y="942" font-family="monospace" font-size="15" fill="#64748b">SHANGHAI BUND · 2026.11.02 · ISO 100 1/60s</text>
  <circle cx="670" cy="915" r="18" fill="#dc2626"/>
  <text x="670" y="922" font-family="serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Leica</text>
</svg>`)}`;

const SVG_FORBIDDEN_CITY = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 960" width="720" height="960">
  <defs>
    <linearGradient id="snowsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="60%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="720" height="960" fill="url(#snowsky)"/>
  <circle cx="80" cy="120" r="3" fill="#ffffff" opacity="0.9"/>
  <circle cx="210" cy="200" r="4" fill="#ffffff" opacity="0.85"/>
  <circle cx="360" cy="110" r="2.5" fill="#ffffff" opacity="0.95"/>
  <circle cx="510" cy="180" r="3.5" fill="#ffffff" opacity="0.9"/>
  <circle cx="640" cy="90" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="150" cy="360" r="3" fill="#ffffff" opacity="0.9"/>
  <circle cx="420" cy="340" r="3.5" fill="#ffffff" opacity="0.85"/>
  <circle cx="580" cy="420" r="2.5" fill="#ffffff" opacity="0.9"/>
  <path d="M 120,440 Q 240,400 360,400 Q 480,400 600,440 L 580,480 L 140,480 Z" fill="#b45309"/>
  <rect x="0" y="520" width="720" height="350" fill="#991b1b"/>
  <rect x="0" y="520" width="720" height="24" fill="#7f1d1d"/>
  <path d="M -40,480 Q 360,420 760,480 L 740,540 Q 360,480 -20,540 Z" fill="#d97706"/>
  <path d="M -40,480 Q 360,410 760,480 L 760,500 Q 360,430 -40,500 Z" fill="#fbbf24"/>
  <path d="M -40,480 Q 360,410 760,480 Q 720,470 600,460 Q 360,400 120,460 Q 40,470 -40,480 Z" fill="#ffffff"/>
  <rect x="80" y="600" width="90" height="180" rx="8" fill="#7f1d1d"/>
  <rect x="220" y="600" width="90" height="180" rx="8" fill="#7f1d1d"/>
  <rect x="410" y="600" width="90" height="180" rx="8" fill="#7f1d1d"/>
  <rect x="550" y="600" width="90" height="180" rx="8" fill="#7f1d1d"/>
  <circle cx="105" cy="640" r="4" fill="#fbbf24"/>
  <circle cx="145" cy="640" r="4" fill="#fbbf24"/>
  <circle cx="105" cy="680" r="4" fill="#fbbf24"/>
  <circle cx="145" cy="680" r="4" fill="#fbbf24"/>
  <path d="M 0,800 Q 240,760 480,780 Q 640,790 720,770 L 720,870 L 0,870 Z" fill="#f8fafc"/>
  <path d="M 0,830 Q 360,800 720,830 L 720,870 L 0,870 Z" fill="#e2e8f0"/>
  <path d="M 0,220 Q 120,240 220,180 Q 300,160 380,190" stroke="#292524" stroke-width="12" fill="none" stroke-linecap="round"/>
  <circle cx="220" cy="180" r="30" fill="#14532d"/>
  <circle cx="340" cy="180" r="26" fill="#14532d"/>
  <ellipse cx="220" cy="165" rx="26" ry="10" fill="#ffffff"/>
  <ellipse cx="340" cy="168" rx="22" ry="9" fill="#ffffff"/>
  <rect x="580" y="240" width="70" height="70" fill="#dc2626" rx="6"/>
  <rect x="585" y="245" width="60" height="60" fill="none" stroke="#fef08a" stroke-width="2" rx="4"/>
  <text x="615" y="286" font-family="'Noto Serif SC', serif" font-size="28" font-weight="bold" fill="#fef08a" text-anchor="middle">故宫</text>
  <rect x="0" y="870" width="720" height="90" fill="#ffffff" opacity="0.96"/>
  <text x="36" y="915" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">AURORA 16 · 蔡司 T* 经典镜头</text>
  <text x="36" y="942" font-family="monospace" font-size="15" fill="#64748b">FORBIDDEN CITY · 2026.10.28 · 35mm f/1.8</text>
  <circle cx="670" cy="915" r="18" fill="#dc2626"/>
  <text x="670" y="922" font-family="serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">ZEISS</text>
</svg>`)}`;

const SVG_WUZHEN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 960" width="720" height="960">
  <defs>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="40%" stop-color="#e2e8f0"/>
      <stop offset="70%" stop-color="#ccfbf1"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="720" height="960" fill="url(#mist)"/>
  <path d="M 0,380 Q 180,300 360,340 Q 540,290 720,330 L 720,500 L 0,500 Z" fill="#94a3b8" opacity="0.4"/>
  <polygon points="40,420 180,380 240,410 240,620 40,620" fill="#f1f5f9"/>
  <polygon points="20,420 180,370 200,420" fill="#334155"/>
  <rect x="70" y="460" width="40" height="60" rx="3" fill="#475569"/>
  <rect x="140" y="460" width="40" height="60" rx="3" fill="#475569"/>
  <line x1="180" y1="410" x2="180" y2="435" stroke="#1e293b" stroke-width="2"/>
  <ellipse cx="180" cy="450" rx="14" ry="18" fill="#dc2626"/>
  <ellipse cx="180" cy="450" rx="6" ry="18" fill="#f59e0b"/>
  <polygon points="520,400 680,370 720,390 720,620 520,620" fill="#f8fafc"/>
  <polygon points="500,400 680,360 700,400" fill="#334155"/>
  <rect x="560" y="450" width="45" height="65" rx="3" fill="#475569"/>
  <path d="M 180,560 Q 360,420 540,560 L 540,640 Q 360,530 180,640 Z" fill="#64748b"/>
  <path d="M 220,640 Q 360,510 500,640 Z" fill="#0d9488"/>
  <rect x="0" y="600" width="720" height="270" fill="#115e59"/>
  <path d="M 0,600 Q 360,580 720,600 L 720,870 L 0,870 Z" fill="#134e4a"/>
  <path d="M 310,680 Q 360,660 440,680 Q 450,710 430,715 L 320,715 Q 300,710 310,680 Z" fill="#451a03"/>
  <path d="M 345,680 Q 380,640 415,680 Z" fill="#1c1917"/>
  <line x1="315" y1="695" x2="270" y2="730" stroke="#78350f" stroke-width="5"/>
  <path d="M 0,100 Q 140,80 240,160" stroke="#334155" stroke-width="6" fill="none"/>
  <path d="M 60,110 Q 70,220 50,320" stroke="#15803d" stroke-width="2.5" fill="none"/>
  <path d="M 120,120 Q 140,240 120,350" stroke="#15803d" stroke-width="2.5" fill="none"/>
  <path d="M 180,140 Q 200,260 170,360" stroke="#15803d" stroke-width="2" fill="none"/>
  <rect x="590" y="160" width="60" height="60" fill="#b91c1c" rx="5"/>
  <text x="620" y="202" font-family="'Noto Serif SC', serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">乌镇</text>
  <rect x="0" y="870" width="720" height="90" fill="#ffffff" opacity="0.96"/>
  <text x="36" y="915" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">AURORA 16 · 华智大师影像 50MP</text>
  <text x="36" y="942" font-family="monospace" font-size="15" fill="#64748b">WUZHEN WATER TOWN · 2026.10.15 · f/2.0</text>
  <circle cx="670" cy="915" r="18" fill="#dc2626"/>
  <text x="670" y="922" font-family="serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">50MP</text>
</svg>`)}`;

export const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'photo_1',
    url: SVG_SHANGHAI,
    title: '上海外滩夜色 (Shanghai)',
    date: '2026-11-02',
    location: '上海 · 外滩',
    filter: '赛博夜景'
  },
  {
    id: 'photo_2',
    url: SVG_FORBIDDEN_CITY,
    title: '故宫红墙白雪 (Forbidden City)',
    date: '2026-10-28',
    location: '北京 · 故宫博物院',
    filter: '经典国风'
  },
  {
    id: 'photo_3',
    url: SVG_WUZHEN,
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
