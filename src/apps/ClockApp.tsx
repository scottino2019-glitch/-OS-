import React, { useState, useEffect, useRef } from 'react';
import { usePhone } from '../context/PhoneContext';
import { sound } from '../utils/sound';
import {
  Globe,
  AlarmClock,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';

interface AlarmItem {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  repeat: string;
}

const WORLD_CITIES = [
  { name: '北京 (Beijing)', zone: 'Asia/Shanghai', offset: '+8' },
  { name: '罗马 (Roma)', zone: 'Europe/Rome', offset: '+1' },
  { name: '东京 (Tokyo)', zone: 'Asia/Tokyo', offset: '+9' },
  { name: '伦敦 (London)', zone: 'Europe/London', offset: '+0' },
  { name: '纽约 (New York)', zone: 'America/New_York', offset: '-5' }
];

export const ClockApp: React.FC = () => {
  const { t, showToast } = usePhone();
  const [tab, setTab] = useState<'clock' | 'alarm' | 'stopwatch'>('clock');

  // Live time
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', time: '07:30', label: '晨间闹铃 (Sveglia)', enabled: true, repeat: '工作日' },
    { id: '2', time: '12:30', label: '午休小憩 (Pausa)', enabled: false, repeat: '每天' },
    { id: '3', time: '22:00', label: '阅读时刻 (Lettura)', enabled: true, repeat: '每天' }
  ]);
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('新闹钟');

  // Stopwatch
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<number | null>(null);

  useEffect(() => {
    if (stopwatchRunning) {
      const startTime = performance.now() - stopwatchMs;
      stopwatchRef.current = window.setInterval(() => {
        setStopwatchMs(performance.now() - startTime);
      }, 30);
    } else if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchRunning]);

  const toggleStopwatch = () => {
    sound.playTap();
    setStopwatchRunning(!stopwatchRunning);
  };

  const resetStopwatch = () => {
    sound.playTap();
    setStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
  };

  const recordLap = () => {
    sound.playTap();
    setLaps(prev => [stopwatchMs, ...prev]);
  };

  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Tabs */}
      <div className="flex items-center justify-around py-3 bg-white border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setTab('clock')}
          className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
            tab === 'clock' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500'
          }`}
        >
          <Globe size={16} />
          <span>{t('世界时钟', 'Orologio')}</span>
        </button>
        <button
          onClick={() => setTab('alarm')}
          className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
            tab === 'alarm' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500'
          }`}
        >
          <AlarmClock size={16} />
          <span>{t('闹钟', 'Sveglia')}</span>
        </button>
        <button
          onClick={() => setTab('stopwatch')}
          className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
            tab === 'stopwatch' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500'
          }`}
        >
          <TimerIcon size={16} />
          <span>{t('秒表', 'Cronometro')}</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-4 slim-scrollbar">
        {/* World Clocks */}
        {tab === 'clock' && (
          <div className="space-y-3">
            {/* Beijing Main Digital Clock */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 rounded-3xl text-center shadow-xs">
              <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">北京标准时间 (Beijing Time)</span>
              <div className="text-5xl font-mono font-light text-slate-900 my-2 tracking-wider">
                {now.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' })}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {now.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Other cities list */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-600 px-1">
                {t('主要全球城市', 'Città Globali')}
              </div>
              {WORLD_CITIES.map(city => {
                const cityTime = now.toLocaleTimeString('zh-CN', {
                  timeZone: city.zone,
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div
                    key={city.name}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{city.name}</div>
                      <div className="text-xs text-slate-500">时区偏差 UTC{city.offset}</div>
                    </div>
                    <div className="text-2xl font-mono font-light text-slate-800">
                      {cityTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alarms */}
        {tab === 'alarm' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{t('我的闹钟', 'Le mie sveglie')}</span>
              <button
                onClick={() => setShowAddAlarm(true)}
                className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <Plus size={16} />
                <span>{t('新建闹钟', 'Nuova')}</span>
              </button>
            </div>

            {alarms.map(alarm => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs"
              >
                <div>
                  <div className="text-3xl font-mono text-slate-900 font-light">{alarm.time}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                    <span>{alarm.label}</span>
                    <span>·</span>
                    <span>{alarm.repeat}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playTap();
                      setAlarms(prev =>
                        prev.map(a => (a.id === alarm.id ? { ...a, enabled: !a.enabled } : a))
                      );
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      alarm.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => {
                      sound.playTap();
                      setAlarms(prev => prev.filter(a => a.id !== alarm.id));
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {showAddAlarm && (
              <div className="p-4 bg-white border border-slate-300 rounded-2xl space-y-3 mt-3 shadow-lg">
                <div className="text-xs font-bold text-slate-900">设置新闹钟</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={e => setNewAlarmTime(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="标签说明"
                    value={newAlarmLabel}
                    onChange={e => setNewAlarmLabel(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddAlarm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      setAlarms(prev => [
                        ...prev,
                        {
                          id: String(Date.now()),
                          time: newAlarmTime,
                          label: newAlarmLabel,
                          enabled: true,
                          repeat: '每天'
                        }
                      ]);
                      setShowAddAlarm(false);
                      showToast('闹钟已设定');
                    }}
                    className="px-4 py-1.5 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stopwatch */}
        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center justify-center pt-8 space-y-6">
            <div className="text-5xl font-mono font-light text-slate-900 tracking-wider">
              {formatStopwatch(stopwatchMs)}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={resetStopwatch}
                className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 active:scale-95 transition-transform"
              >
                <RotateCcw size={22} />
              </button>

              <button
                onClick={toggleStopwatch}
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-white shadow-xl active:scale-95 transition-transform ${
                  stopwatchRunning
                    ? 'bg-rose-600'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {stopwatchRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>

              <button
                onClick={recordLap}
                disabled={!stopwatchRunning}
                className="w-14 h-14 rounded-full bg-slate-200 disabled:opacity-40 flex items-center justify-center text-amber-700 font-bold active:scale-95 transition-transform"
              >
                计次
              </button>
            </div>

            {laps.length > 0 && (
              <div className="w-full max-w-xs space-y-1.5 pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-600 pb-1">计次分段 (Giri registrati)</div>
                {laps.map((lap, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs font-mono py-1.5 border-b border-slate-100 text-slate-800 font-semibold"
                  >
                    <span>第 {laps.length - i} 次</span>
                    <span>{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
