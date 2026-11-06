import React, { useState, useRef } from 'react';
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
  Layers,
  ShoppingBag,
  MessageSquare,
  Camera,
  Film,
  Radio,
  Cpu,
  Smartphone,
  Heart,
  Zap,
  Coffee,
  Cloud,
  Mail,
  FileText,
  Search,
  Play,
  Star,
  MapPin,
  Shield,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';

const ICON_CHOICES = [
  { name: 'Globe', comp: Globe, label: '网页' },
  { name: 'Gamepad2', comp: Gamepad2, label: '游戏' },
  { name: 'Palette', comp: Palette, label: '设计' },
  { name: 'BookOpen', comp: BookOpen, label: '阅读' },
  { name: 'Compass', comp: Compass, label: '探索' },
  { name: 'Code', comp: Code, label: '编程' },
  { name: 'Music', comp: Music, label: '音乐' },
  { name: 'Video', comp: Video, label: '视频' },
  { name: 'ShoppingBag', comp: ShoppingBag, label: '购物' },
  { name: 'MessageSquare', comp: MessageSquare, label: '聊天' },
  { name: 'Camera', comp: Camera, label: '拍照' },
  { name: 'Film', comp: Film, label: '影音' },
  { name: 'Radio', comp: Radio, label: '电台' },
  { name: 'Cpu', comp: Cpu, label: '科技' },
  { name: 'Smartphone', comp: Smartphone, label: '手机' },
  { name: 'Heart', comp: Heart, label: '健康' },
  { name: 'Zap', comp: Zap, label: '效率' },
  { name: 'Coffee', comp: Coffee, label: '生活' },
  { name: 'Cloud', comp: Cloud, label: '云端' },
  { name: 'Mail', comp: Mail, label: '邮件' },
  { name: 'FileText', comp: FileText, label: '文档' },
  { name: 'Search', comp: Search, label: '搜索' },
  { name: 'Play', comp: Play, label: '播放' },
  { name: 'Star', comp: Star, label: '收藏' },
  { name: 'MapPin', comp: MapPin, label: '地图' },
  { name: 'Shield', comp: Shield, label: '安全' },
  { name: 'Layers', comp: Layers, label: '多任务' },
  { name: 'Sparkles', comp: Sparkles, label: 'AI' }
];

const GRADIENT_PRESETS = [
  { name: '翡翠海蓝', class: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { name: '日落暖霞', class: 'from-amber-400 via-orange-500 to-rose-500' },
  { name: '幻彩极光', class: 'from-violet-500 via-purple-500 to-indigo-600' },
  { name: '星空幽蓝', class: 'from-cyan-400 via-blue-500 to-indigo-700' },
  { name: '胭脂珊瑚', class: 'from-pink-500 via-rose-500 to-red-600' },
  { name: '钛金玄墨', class: 'from-slate-700 via-slate-800 to-slate-900' },
  { name: '琉璃翠玉', class: 'from-lime-400 via-emerald-500 to-teal-700' },
  { name: '晚霞暮紫', class: 'from-fuchsia-500 via-purple-600 to-indigo-800' }
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
  const [iconDisplayLayout, setIconDisplayLayout] = useState<'grid' | 'carousel'>('grid');

  const horizontalScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollHorizontal = (offset: number) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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
    showToast(`应用「${formName.trim()}」已成功安装至桌面`);
  };

  const categories = ['全部', '工具', '游戏娱乐', '创意工具', '学习百科'];

  const filteredApps = installedApps.filter(app => {
    if (activeCategory === '全部') return true;
    return app.category === activeCategory;
  });

  const SelectedIconComp = ICON_CHOICES.find(i => i.name === formIcon)?.comp || Globe;

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-none">
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200 shrink-0">
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
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-scroll">
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
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 slim-scrollbar touch-scroll">
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
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="卸载此应用"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto touch-scroll">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl animate-in fade-in max-h-[92vh] overflow-y-auto touch-scroll slim-scrollbar my-auto">
            {/* Modal Title & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-600" />
                <span>{t('添加外部网页应用', 'Aggiungi App Esterna')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1 rounded-lg"
              >
                {t('取消', 'Annulla')}
              </button>
            </div>

            <form onSubmit={handleAddApp} className="space-y-3 pt-3 text-xs">
              {/* Live Preview Box of the App Icon */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div
                  className={`w-13 h-13 rounded-[22%] bg-gradient-to-br ${formGradient} flex items-center justify-center text-white shrink-0 shadow-md transition-all duration-200`}
                >
                  <SelectedIconComp size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {formName || '应用名称预览'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {formSubName || '副标题 / 分类'} · 图标: {formIcon}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-mono truncate">
                    {formUrl || 'https://...'}
                  </div>
                </div>
              </div>

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

              {/* Icon Selector with Full Touch Scrolling and Layout Switcher */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <span>{t('选择图标样式 (Icona)', 'Seleziona Icona')}</span>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-bold">
                      {ICON_CHOICES.length} 个
                    </span>
                  </label>

                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIconDisplayLayout('grid')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        iconDisplayLayout === 'grid'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Vista a griglia"
                    >
                      Griglia
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconDisplayLayout('carousel')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        iconDisplayLayout === 'carousel'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Vista a carosello orizzontale"
                    >
                      Riga
                    </button>
                  </div>
                </div>

                {/* Option 1: Scrollable Grid (Smooth Vertical Touch Scroll) */}
                {iconDisplayLayout === 'grid' ? (
                  <div className="max-h-36 overflow-y-auto touch-scroll slim-scrollbar p-2 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-6 gap-2">
                    {ICON_CHOICES.map(iconItem => {
                      const Comp = iconItem.comp;
                      const isSelected = formIcon === iconItem.name;
                      return (
                        <button
                          type="button"
                          key={iconItem.name}
                          onClick={() => setFormIcon(iconItem.name)}
                          className={`h-10 w-full flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 scale-105'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                          }`}
                          title={`${iconItem.label} (${iconItem.name})`}
                        >
                          <Comp size={18} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Option 2: Horizontal Carousel with Left/Right Arrow Controls & shrink-0 buttons */
                  <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(-120)}
                      className="p-1 text-slate-500 hover:text-slate-900 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 mr-1 active:scale-90"
                      title="Scorri a sinistra"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div
                      ref={horizontalScrollRef}
                      className="flex items-center gap-2 overflow-x-auto touch-scroll slim-scrollbar py-1 flex-1"
                    >
                      {ICON_CHOICES.map(iconItem => {
                        const Comp = iconItem.comp;
                        const isSelected = formIcon === iconItem.name;
                        return (
                          <button
                            type="button"
                            key={iconItem.name}
                            onClick={() => setFormIcon(iconItem.name)}
                            className={`p-2.5 rounded-xl shrink-0 transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 scale-105'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                            title={`${iconItem.label} (${iconItem.name})`}
                          >
                            <Comp size={18} />
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollHorizontal(120)}
                      className="p-1 text-slate-500 hover:text-slate-900 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 ml-1 active:scale-90"
                      title="Scorri a destra"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Gradient Selector with touch-scroll and shrink-0 */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  {t('色彩渐变 (Gradiente)', 'Gradiente Sfondo')}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto touch-scroll slim-scrollbar py-1.5 px-1 bg-slate-50 border border-slate-200 rounded-2xl">
                  {GRADIENT_PRESETS.map(g => (
                    <button
                      type="button"
                      key={g.name}
                      onClick={() => setFormGradient(g.class)}
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g.class} shrink-0 transition-all active:scale-95 ${
                        formGradient === g.class
                          ? 'scale-110 ring-2 ring-indigo-600 ring-offset-2 shadow-sm'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      title={g.name}
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
