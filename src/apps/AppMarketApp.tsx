import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import {
  Plus,
  RefreshCw,
  Trash2,
  Sparkles,
  Globe,
  Gamepad2,
  Palette,
  BookOpen,
  Compass,
  Code,
  Music,
  Video,
  Layers
} from 'lucide-react';

const ICON_CHOICES = [
  { name: 'Globe', comp: Globe },
  { name: 'Gamepad2', comp: Gamepad2 },
  { name: 'Palette', comp: Palette },
  { name: 'BookOpen', comp: BookOpen },
  { name: 'Compass', comp: Compass },
  { name: 'Code', comp: Code },
  { name: 'Music', comp: Music },
  { name: 'Video', comp: Video }
];

const GRADIENT_PRESETS = [
  { name: '翡翠海蓝', class: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { name: '日落暖霞', class: 'from-amber-400 via-orange-500 to-rose-500' },
  { name: '幻彩极光', class: 'from-violet-500 via-purple-500 to-indigo-600' },
  { name: '星空幽蓝', class: 'from-cyan-400 via-blue-500 to-indigo-700' },
  { name: '胭脂珊瑚', class: 'from-pink-500 via-rose-500 to-red-600' },
  { name: '钛金玄墨', class: 'from-slate-700 via-slate-800 to-slate-900' }
];

export const AppMarketApp: React.FC = () => {
  const {
    installedApps,
    addCustomApp,
    removeApp,
    reloadPublicApps,
    openApp,
    t,
    showToast
  } = usePhone();

  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formUrl, setFormUrl] = useState('');
  const [formName, setFormName] = useState('');
  const [formSubName, setFormSubName] = useState('');
  const [formCategory, setFormCategory] = useState('工具');
  const [formIcon, setFormIcon] = useState('Globe');
  const [formGradient, setFormGradient] = useState(GRADIENT_PRESETS[0].class);

  const handleRefreshPublic = async () => {
    setIsRefreshing(true);
    const count = await reloadPublicApps();
    setIsRefreshing(false);
    showToast(`已从 public/apps.json 同步 ${count} 个应用`);
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim() || !formName.trim()) {
      showToast('请输入有效的应用名称与网页链接');
      return;
    }

    let validUrl = formUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    addCustomApp({
      name: formName.trim(),
      subName: formSubName.trim() || '外部应用',
      description: '来自自定义添加的外部链接',
      category: formCategory,
      icon: formIcon,
      gradient: formGradient,
      url: validUrl,
      displayMode: 'iframe',
      badge: '新装'
    });

    setFormUrl('');
    setFormName('');
    setFormSubName('');
    setShowAddModal(false);
  };

  const categories = ['全部', '工具', '游戏娱乐', '创意工具', '学习百科'];

  const filteredApps = installedApps.filter(app => {
    if (activeCategory === '全部') return true;
    return app.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{t('应用中心与外部链接', 'App Market')}</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {installedApps.length} 款
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {t('支持 public/apps.json 自动同步与自定义添加', 'Gestione app e link esterni')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshPublic}
              disabled={isRefreshing}
              title="重新读取 /public/apps.json"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={17} className={isRefreshing ? 'animate-spin text-amber-500' : ''} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>{t('添加应用', 'Aggiungi')}</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg whitespace-nowrap font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Installed & Available Apps List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 slim-scrollbar">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Layers size={40} className="mb-2 opacity-40 text-slate-300" />
            <p className="text-sm font-semibold">{t('暂无此分类应用', 'Nessuna app in questa categoria')}</p>
          </div>
        ) : (
          filteredApps.map(app => {
            const IconObj = ICON_CHOICES.find(i => i.name === app.icon)?.comp || Globe;
            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-[22%] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shrink-0 shadow-md`}
                  >
                    <IconObj size={24} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{app.name}</h4>
                      {app.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.2 rounded border border-amber-300">
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">{app.subName}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{app.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openApp(app.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    {t('打开', 'Apri')}
                  </button>

                  {app.isCustom && (
                    <button
                      onClick={() => removeApp(app.id)}
                      title="卸载应用"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Simplified public directory tip box */}
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1.5">
          <div className="text-indigo-700 font-bold flex items-center gap-1.5">
            <Sparkles size={16} />
            <span>{t('提示：public/apps.json 格式极简', 'Guida JSON Semplice')}</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Basta scrivere in <code className="text-indigo-800 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">public/apps.json</code>:
          </p>
          <pre className="p-2 bg-white rounded-xl text-slate-800 font-mono text-xs border border-indigo-200 overflow-x-auto">
{`[
  { "name": "Mio Sito", "url": "https://esempio.com" }
]`}
          </pre>
          <p className="text-slate-600 text-[11px]">
            Il telefono genererà automaticamente icona, colori ed effetti!
          </p>
        </div>
      </div>

      {/* Add App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-600" />
                <span>{t('添加外部网页应用', 'Aggiungi App Esterna')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1"
              >
                {t('取消', 'Annulla')}
              </button>
            </div>

            <form onSubmit={handleAddApp} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">网页链接 (URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">应用名称 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如：网易云音乐"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">副标题 (Sottotitolo)</label>
                  <input
                    type="text"
                    placeholder="如：Music Web"
                    value={formSubName}
                    onChange={e => setFormSubName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">图标样式 (Icona)</label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {ICON_CHOICES.map(iconItem => {
                    const Comp = iconItem.comp;
                    return (
                      <button
                        type="button"
                        key={iconItem.name}
                        onClick={() => setFormIcon(iconItem.name)}
                        className={`p-2.5 rounded-xl transition-all ${
                          formIcon === iconItem.name
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Comp size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gradient Selector */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">色彩渐变 (Gradiente)</label>
                <div className="flex items-center gap-2">
                  {GRADIENT_PRESETS.map(g => (
                    <button
                      type="button"
                      key={g.name}
                      onClick={() => setFormGradient(g.class)}
                      className={`w-7 h-7 rounded-xl bg-gradient-to-br ${g.class} transition-transform ${
                        formGradient === g.class ? 'scale-125 ring-2 ring-slate-800' : 'opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] mt-2"
              >
                {t('确认安装至手机桌面', 'Installa sulla schermata Home')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
