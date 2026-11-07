import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { getLunarDateString, WEEKDAYS_SHORT_ZH } from '../utils/lunar';
import { CalendarEvent } from '../types/phone';
import { sound } from '../utils/sound';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  FileText,
  Copy,
  Check,
  X,
  Edit3,
  BookmarkPlus
} from 'lucide-react';

const EVENT_TAGS: CalendarEvent['tag'][] = ['会议', '纪念日', '行程', '待办', '生活'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const CalendarApp: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    addNote,
    t,
    showToast
  } = usePhone();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // Event & Notes Viewer / Editor Modal State
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventTime, setEditEventTime] = useState('10:00');
  const [editEventTag, setEditEventTag] = useState<CalendarEvent['tag']>('待办');
  const [editEventColor, setEditEventColor] = useState(COLOR_OPTIONS[0]);
  const [editEventNotes, setEditEventNotes] = useState('');
  const [isCopiedNotes, setIsCopiedNotes] = useState(false);

  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newTag, setNewTag] = useState<CalendarEvent['tag']>('待办');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [newNotes, setNewNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedLunarInfo = getLunarDateString(selectedDate);

  const selectedDayEvents = calendarEvents.filter(e => e.date === selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('请输入日程标题');
      return;
    }
    addCalendarEvent({
      title: newTitle.trim(),
      date: selectedDateStr,
      time: newTime,
      tag: newTag,
      color: newColor,
      notes: newNotes.trim() || undefined
    });
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const openEventDetails = (evt: CalendarEvent) => {
    sound.playTap();
    setViewingEvent(evt);
    setIsEditingEvent(false);
    setEditEventTitle(evt.title);
    setEditEventTime(evt.time);
    setEditEventTag(evt.tag);
    setEditEventColor(evt.color);
    setEditEventNotes(evt.notes || '');
  };

  const handleCopyEventNotes = () => {
    if (!viewingEvent) return;
    const textToCopy = viewingEvent.notes
      ? `${viewingEvent.title}\nData: ${viewingEvent.date} ore ${viewingEvent.time}\n\nNote:\n${viewingEvent.notes}`
      : `${viewingEvent.title}\nData: ${viewingEvent.date} ore ${viewingEvent.time}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopiedNotes(true);
    showToast('Note del calendario copiate negli appunti');
    setTimeout(() => setIsCopiedNotes(false), 2000);
  };

  const handleExportToNotesApp = () => {
    if (!viewingEvent) return;
    addNote({
      title: viewingEvent.title,
      content: viewingEvent.notes
        ? `[Promemoria Calendario: ${viewingEvent.date} ${viewingEvent.time}]\n\n${viewingEvent.notes}`
        : `[Promemoria Calendario: ${viewingEvent.date} ${viewingEvent.time}]`,
      tag: '备忘',
      color: viewingEvent.color,
      isPinned: false
    });
    showToast('Nota salvata con successo nell\'app Note!');
  };

  const handleSaveEditedEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingEvent || !editEventTitle.trim()) return;
    const updatedNotes = editEventNotes.trim() || undefined;
    updateCalendarEvent(viewingEvent.id, {
      title: editEventTitle.trim(),
      time: editEventTime,
      tag: editEventTag,
      color: editEventColor,
      notes: updatedNotes
    });
    setViewingEvent({
      ...viewingEvent,
      title: editEventTitle.trim(),
      time: editEventTime,
      tag: editEventTag,
      color: editEventColor,
      notes: updatedNotes
    });
    setIsEditingEvent(false);
    showToast('Evento e note salvati con successo');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Calendar Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {year}年 {month + 1}月
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {selectedLunarInfo.lunarMonth}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedLunarInfo.fullLunar}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-bold mr-1"
            >
              {t('今天', 'Oggi')}
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center py-1">
          {WEEKDAYS_SHORT_ZH.map((day, idx) => (
            <span
              key={day}
              className={`text-xs font-bold ${idx === 0 || idx === 6 ? 'text-rose-600' : 'text-slate-600'}`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 shadow-xs">
        <div className="grid grid-cols-7 gap-1">
          {/* Previous month trailing days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="h-10 sm:h-11 flex flex-col items-center justify-center rounded-xl text-slate-300"
              >
                <span className="text-xs">{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const thisDate = new Date(year, month, dayNum);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected =
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month &&
              selectedDate.getDate() === dayNum;

            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            const dayLunar = getLunarDateString(thisDate);
            const hasEvents = calendarEvents.some(e => e.date === dateStr);

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDate(thisDate)}
                className={`relative h-10 sm:h-11 py-0.5 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs scale-[1.03]'
                    : isToday
                    ? 'bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span className="text-sm font-bold leading-none">{dayNum}</span>
                <span
                  className={`text-[10px] mt-0.5 leading-none truncate max-w-[95%] font-medium ${
                    isSelected
                      ? 'text-emerald-100'
                      : dayLunar.solarTerm
                      ? 'text-amber-600 font-bold'
                      : dayLunar.festival
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {dayLunar.solarTerm || dayLunar.festival || dayLunar.lunarDay}
                </span>

                {/* Event indicator dot */}
                {hasEvents && (
                  <span
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda & Event List */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 {t('当日日程', 'Eventi')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {selectedLunarInfo.solarTerm ? `[${selectedLunarInfo.solarTerm}]` : ''} {selectedLunarInfo.lunarDay}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>{t('添加日程', 'Aggiungi')}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 slim-scrollbar touch-scroll">
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-slate-400">
              <CalendarIcon size={36} className="mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">{t('今日暂无日程安排', 'Nessun impegno in questa data')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('享受轻松惬意的时光', 'Giornata libera')}</p>
            </div>
          ) : (
            selectedDayEvents.map(evt => (
              <div
                key={evt.id}
                onClick={() => openEventDetails(evt)}
                className="flex items-start justify-between p-3.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-xs transition-all cursor-pointer active:scale-[0.98] group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-2.5 h-12 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: evt.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {evt.title}
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md shrink-0">
                        {evt.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Clock size={13} className="text-emerald-600 shrink-0" />
                      <span className="font-medium">{evt.time}</span>
                    </div>

                    {/* Note preview button badge */}
                    {evt.notes ? (
                      <div className="mt-2 bg-emerald-50/80 border border-emerald-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs text-emerald-950">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText size={13} className="text-emerald-700 shrink-0" />
                          <span className="truncate font-medium">{evt.notes}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold ml-2 shrink-0 underline">
                          Apri nota
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block mt-1.5 text-[10px] text-slate-400 font-medium group-hover:text-emerald-600">
                        + Tocca per aprire e aggiungere note
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playTap();
                      deleteCalendarEvent(evt.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Details & Notes Modal */}
      {viewingEvent && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92%] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: viewingEvent.color }}
                />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('日程详情与备注', 'Dettagli Evento')}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {viewingEvent.tag}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  setViewingEvent(null);
                  setIsEditingEvent(false);
                }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Read Mode vs In-place Edit Mode */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 slim-scrollbar">
              {!isEditingEvent ? (
                <>
                  {/* Event Title */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {viewingEvent.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                      <Clock size={14} className="text-emerald-600" />
                      <span>{viewingEvent.date} · {viewingEvent.time}</span>
                      <span>·</span>
                      <span className="text-amber-700 font-semibold">{selectedLunarInfo.fullLunar}</span>
                    </div>
                  </div>

                  {/* Event Notes Card */}
                  <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <FileText size={15} className="text-emerald-700" />
                        <span>{t('便签备注', 'Note dell\'Evento')}</span>
                      </span>
                      {viewingEvent.notes && (
                        <button
                          onClick={handleCopyEventNotes}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-300 active:scale-95 transition-all"
                        >
                          {isCopiedNotes ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{isCopiedNotes ? 'Copiato!' : 'Copia'}</span>
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap bg-white/90 p-3 rounded-xl border border-emerald-150 min-h-[70px]">
                      {viewingEvent.notes || (
                        <span className="text-slate-400 italic">
                          {t('暂无详细备注，点击下方“编辑”添加', 'Nessuna nota presente. Tocca "Modifica" per scriverne una.')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Export to Notes App & Edit */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleExportToNotesApp}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-all active:scale-95"
                    >
                      <BookmarkPlus size={16} className="text-amber-600" />
                      <span>{t('同步保存至便签本', 'Salva nell\'app Note')}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sound.playTap();
                          setIsEditingEvent(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <Edit3 size={15} />
                        <span>{t('修改日程与备注', 'Modifica')}</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playTap();
                          deleteCalendarEvent(viewingEvent.id);
                          setViewingEvent(null);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all active:scale-95"
                      >
                        <Trash2 size={15} />
                        <span>{t('删除日程', 'Elimina')}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSaveEditedEvent} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Titolo</label>
                    <input
                      type="text"
                      required
                      value={editEventTitle}
                      onChange={e => setEditEventTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Orario</label>
                      <input
                        type="time"
                        value={editEventTime}
                        onChange={e => setEditEventTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Categoria</label>
                      <select
                        value={editEventTag}
                        onChange={e => setEditEventTag(e.target.value as CalendarEvent['tag'])}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      >
                        {EVENT_TAGS.map(tg => (
                          <option key={tg} value={tg}>{tg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color select */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Colore Etichetta</label>
                    <div className="flex items-center gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setEditEventColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            editEventColor === c ? 'scale-125 ring-2 ring-slate-800' : 'opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Multi-line notes textarea */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Note e Dettagli</label>
                    <textarea
                      rows={4}
                      value={editEventNotes}
                      onChange={e => setEditEventNotes(e.target.value)}
                      placeholder="Scrivi qui i dettagli, promemoria, luogo, appunti..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingEvent(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Salva Note
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl max-h-[92%] flex flex-col overflow-y-auto slim-scrollbar animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-600" />
                <span>{t('新建日程事项', 'Nuovo Evento')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1"
              >
                {t('取消', 'Annulla')}
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('日程标题', 'Titolo')}</label>
                <input
                  type="text"
                  required
                  placeholder="例如：团队周会 / 探望好友"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('时间', 'Orario')}</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('分类', 'Categoria')}</label>
                  <select
                    value={newTag}
                    onChange={e => setNewTag(e.target.value as CalendarEvent['tag'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {EVENT_TAGS.map(tg => (
                      <option key={tg} value={tg}>{tg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color tags */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('标签色彩', 'Colore')}</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newColor === c ? 'scale-125 ring-2 ring-slate-800' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('备注详情', 'Dettagli / Note')}</label>
                <textarea
                  placeholder="可输入地点、会议链接或备忘..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {t('保存日程', 'Salva Evento')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
