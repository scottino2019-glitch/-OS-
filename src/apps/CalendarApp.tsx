import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { getLunarDateString, WEEKDAYS_SHORT_ZH } from '../utils/lunar';
import { CalendarEvent } from '../types/phone';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';

const EVENT_TAGS: CalendarEvent['tag'][] = ['会议', '纪念日', '行程', '待办', '生活'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const CalendarApp: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, t, showToast } = usePhone();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
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
                className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-10 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: evt.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {evt.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Clock size={13} className="text-emerald-600" />
                      <span className="font-medium">{evt.time}</span>
                      {evt.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[160px] text-slate-600">{evt.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteCalendarEvent(evt.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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
