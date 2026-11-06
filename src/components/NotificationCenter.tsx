import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { getLunarDateString, WEEKDAYS_ZH } from '../utils/lunar';
import {
  Bell,
  Trash2,
  Calendar,
  Sun,
  Activity,
  X,
  HardDrive
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  icon: 'calendar' | 'backup' | 'weather' | 'health';
}

export const NotificationCenter: React.FC = () => {
  const {
    currentTime,
    isNotificationOpen,
    setNotificationOpen,
    openApp,
    t
  } = usePhone();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: '系统安全与本地备份提示',
      content: '华智本地防护引擎运行中：所有数据均在本地存储，无需上传任何云端服务器。',
      time: '10分钟前',
      icon: 'backup'
    },
    {
      id: 'n2',
      title: '日历节气提醒',
      content: '今日立冬节气：围炉煮茶，万物归藏。',
      time: '30分钟前',
      icon: 'calendar'
    },
    {
      id: 'n3',
      title: '健康与运动步数达成',
      content: '今日已走 8,432 步，达成今日目标 84%，继续保持！',
      time: '1小时前',
      icon: 'health'
    }
  ]);

  if (!isNotificationOpen) return null;

  const lunar = getLunarDateString(currentTime);
  const weekday = WEEKDAYS_ZH[currentTime.getDay()];

  return (
    <div
      onClick={() => setNotificationOpen(false)}
      className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-xl flex flex-col p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm mx-auto space-y-3 pt-2"
      >
        {/* Top Date Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {currentTime.getMonth() + 1}月{currentTime.getDate()}日 {weekday}
            </div>
            <div className="text-xs text-amber-300 font-bold mt-0.5">
              {lunar.fullLunar} {lunar.solarTerm ? `· ${lunar.solarTerm}` : ''}
            </div>
          </div>
          <button
            onClick={() => setNotificationOpen(false)}
            className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between text-xs text-slate-200 font-bold px-1 pt-1">
          <span>{t('通知中心', 'Centro Notifiche')} ({notifications.length})</span>
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="text-rose-300 hover:text-white hover:underline flex items-center gap-1 font-bold"
            >
              <Trash2 size={13} />
              <span>{t('全部清除', 'Cancella tutto')}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[70vh] overflow-y-auto slim-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-300">
              <Bell size={36} className="mx-auto mb-2 opacity-60 text-white" />
              <p className="text-sm font-bold">{t('暂无新通知', 'Nessuna notifica')}</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.icon === 'calendar') openApp('calendar');
                  else if (item.icon === 'backup') openApp('settings');
                  setNotificationOpen(false);
                }}
                className="p-3.5 bg-white/95 border border-white/80 rounded-2xl shadow-md hover:bg-white cursor-pointer active:scale-98 transition-all text-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      {item.icon === 'backup' && <HardDrive size={15} />}
                      {item.icon === 'calendar' && <Calendar size={15} />}
                      {item.icon === 'health' && <Activity size={15} />}
                      {item.icon === 'weather' && <Sun size={15} />}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed pl-9">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
