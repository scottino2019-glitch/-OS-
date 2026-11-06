import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { Note } from '../types/phone';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Share2,
  ChevronLeft,
  Check,
  FileText,
  Tag,
  Palette
} from 'lucide-react';

const TAGS = ['全部', '工作', '生活', '灵感', '备忘', '学习'] as const;
const COLOR_PRESETS = [
  { name: '蔚蓝', hex: '#3b82f6' },
  { name: '翡翠', hex: '#10b981' },
  { name: '紫霞', hex: '#8b5cf6' },
  { name: '琥珀', hex: '#f59e0b' },
  { name: '赤砂', hex: '#ef4444' },
  { name: '青灰', hex: '#64748b' }
];

export const NotesApp: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, t, showToast } = usePhone();
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Editing state for new or selected note
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState<Note['tag']>('备忘');
  const [editColor, setEditColor] = useState(COLOR_PRESETS[0].hex);
  const [editPinned, setEditPinned] = useState(false);

  const startCreateNote = () => {
    setActiveNoteId(null);
    setEditTitle('');
    setEditContent('');
    setEditTag('备忘');
    setEditColor(COLOR_PRESETS[0].hex);
    setEditPinned(false);
    setIsEditing(true);
  };

  const startEditNote = (note: Note) => {
    setActiveNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTag(note.tag);
    setEditColor(note.color);
    setEditPinned(note.isPinned);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim() && !editContent.trim()) {
      showToast('请输入便签内容');
      return;
    }
    const finalTitle = editTitle.trim() || '未命名便签';

    if (activeNoteId) {
      updateNote(activeNoteId, {
        title: finalTitle,
        content: editContent,
        tag: editTag,
        color: editColor,
        isPinned: editPinned
      });
    } else {
      addNote({
        title: finalTitle,
        content: editContent,
        tag: editTag,
        color: editColor,
        isPinned: editPinned
      });
    }
    setIsEditing(false);
  };

  const handleExportSingleNote = (note: Note) => {
    const blob = new Blob([`${note.title}\n\n分类: ${note.tag}\n更新时间: ${note.updatedAt}\n\n${note.content}`], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[\/\?<>\\:\*\|"]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('便签已导出为文本文件');
  };

  const filteredNotes = notes.filter(n => {
    const matchesTag = selectedTag === '全部' || n.tag === selectedTag;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  // Editor View
  if (isEditing) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-text">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 bg-white">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
            <span>{t('返回列表', 'Lista')}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditPinned(!editPinned)}
              title={editPinned ? '取消置顶' : '置顶便签'}
              className={`p-2 rounded-xl transition-colors ${
                editPinned ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pin size={18} className={editPinned ? 'rotate-45' : ''} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Check size={16} />
              <span>{t('完成保存', 'Salva')}</span>
            </button>
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="flex-1 min-h-0 flex flex-col p-4 space-y-3 overflow-hidden">
          <input
            type="text"
            placeholder={t('便签标题...', 'Titolo nota...')}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full text-xl sm:text-2xl font-bold bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none border-b border-slate-200 pb-2"
          />

          {/* Tag & Color Bar */}
          <div className="flex flex-wrap items-center gap-3 py-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Tag size={15} />
              <span>{t('分类', 'Tag')}:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['工作', '生活', '灵感', '备忘', '学习'] as Note['tag'][]).map(tg => (
                <button
                  key={tg}
                  onClick={() => setEditTag(tg)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                    editTag === tg
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          </div>

          {/* Color select */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Palette size={15} />
              <span>{t('色彩', 'Colore')}:</span>
            </div>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setEditColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    editColor === c.hex ? 'scale-125 ring-2 ring-slate-800' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder={t('记录生活与灵感、待办清单或任何备忘...', 'Scrivi qui le tue note, liste o idee...')}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full flex-1 min-h-[160px] bg-white border border-slate-200 rounded-2xl p-4 text-sm sm:text-base leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none shadow-xs"
          />

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200 shrink-0">
            <span>{editContent.length} {t('字', 'caratteri')}</span>
            <span className="font-medium text-emerald-600">{t('支持即时自动本地保存', 'Salvataggio locale')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{t('便签本', 'Note')}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                {notes.length} 条
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {t('日常清单、随手备忘与灵感', 'Promemoria & Liste')}
            </p>
          </div>
          <button
            onClick={startCreateNote}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>{t('新建', 'Nuova')}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('搜索便签内容与标题...', 'Cerca nelle note...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
          />
        </div>

        {/* Tag Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 slim-scrollbar touch-scroll">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
            <FileText size={44} className="mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">{t('暂无相关便签', 'Nessuna nota trovata')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('点击右上角「新建」记录第一条', 'Tocca Nuova in alto per iniziare')}</p>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 px-1">
                  <Pin size={13} className="rotate-45" />
                  <span>{t('置顶便签', 'Fissate in alto')}</span>
                </div>
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onOpen={() => startEditNote(note)}
                    onDelete={() => deleteNote(note.id)}
                    onExport={() => handleExportSingleNote(note)}
                    onTogglePin={() => updateNote(note.id, { isPinned: !note.isPinned })}
                  />
                ))}
              </div>
            )}

            {/* Other Notes */}
            {otherNotes.length > 0 && (
              <div className="space-y-2">
                {pinnedNotes.length > 0 && (
                  <div className="text-xs font-semibold text-slate-500 px-1 pt-1">
                    <span>{t('全部便签', 'Tutte le note')}</span>
                  </div>
                )}
                {otherNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onOpen={() => startEditNote(note)}
                    onDelete={() => deleteNote(note.id)}
                    onExport={() => handleExportSingleNote(note)}
                    onTogglePin={() => updateNote(note.id, { isPinned: !note.isPinned })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NoteCard: React.FC<{
  note: Note;
  onOpen: () => void;
  onDelete: () => void;
  onExport: () => void;
  onTogglePin: () => void;
}> = ({ note, onOpen, onDelete, onExport, onTogglePin }) => {
  return (
    <div
      onClick={onOpen}
      className="group relative bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-xs transition-all hover:border-slate-300 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: note.color }}
            />
            <h3 className="text-sm font-bold text-slate-900 truncate">{note.title}</h3>
            {note.isPinned && (
              <Pin size={13} className="text-amber-500 rotate-45 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {note.content || '（空白内容）'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
            {note.tag}
          </span>
          <span className="text-[11px]">{note.updatedAt}</span>
        </div>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={onTogglePin}
            title={note.isPinned ? '取消置顶' : '置顶'}
            className="p-1.5 text-slate-500 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Pin size={14} className={note.isPinned ? 'rotate-45 text-amber-500' : ''} />
          </button>
          <button
            onClick={onExport}
            title="导出文本"
            className="p-1.5 text-slate-500 hover:text-blue-500 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Share2 size={14} />
          </button>
          <button
            onClick={onDelete}
            title="删除"
            className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
