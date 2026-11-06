import React, { useState, useEffect } from 'react';
import { usePhone } from '../context/PhoneContext';
import { sound } from '../utils/sound';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Delete,
  User,
  Mic,
  Volume2
} from 'lucide-react';

const CONTACTS = [
  { name: '中国移动官方客服', number: '10086', tag: '服务' },
  { name: '极光手机技术支持', number: '400-888-9999', tag: '客服' },
  { name: '紧急求助电话', number: '110', tag: '报警' },
  { name: '医疗急救中心', number: '120', tag: '医疗' },
  { name: '火警救援热线', number: '119', tag: '救援' }
];

export const PhoneDialerApp: React.FC = () => {
  const { t, showToast } = usePhone();

  const [dialedNumber, setDialedNumber] = useState('');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [tab, setTab] = useState<'keypad' | 'contacts'>('keypad');

  useEffect(() => {
    let interval: number | null = null;
    if (activeCall) {
      interval = window.setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  const pressDigit = (digit: string, freq: number) => {
    sound.playDialTone(freq);
    setDialedNumber(prev => prev + digit);
  };

  const handleCall = (num?: string) => {
    const target = num || dialedNumber;
    if (!target) {
      showToast('请输入电话号码');
      return;
    }
    sound.playSuccess();
    setActiveCall(target);
  };

  const handleHangup = () => {
    sound.playTap();
    setActiveCall(null);
    showToast('通话已结束');
  };

  const formatCallTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Active call screen
  if (activeCall) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-sky-50 via-slate-100 to-indigo-100 text-slate-900 items-center justify-between p-8">
        <div className="text-center pt-8">
          <div className="w-22 h-22 rounded-full bg-white border-2 border-indigo-200 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <User size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{activeCall}</h2>
          <p className="text-sm text-indigo-700 font-mono font-bold">
            {t('正在通话中...', 'Chiamata in corso...')} {formatCallTime(callDuration)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button className="w-14 h-14 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-md">
            <Mic size={22} />
          </button>
          <button className="w-14 h-14 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-md">
            <Volume2 size={22} />
          </button>
        </div>

        <div className="pb-8">
          <button
            onClick={handleHangup}
            className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
          >
            <PhoneOff size={30} />
          </button>
        </div>
      </div>
    );
  }

  const KEYPAD_BUTTONS = [
    { num: '1', letters: '', freq: 697 },
    { num: '2', letters: 'ABC', freq: 770 },
    { num: '3', letters: 'DEF', freq: 852 },
    { num: '4', letters: 'GHI', freq: 697 },
    { num: '5', letters: 'JKL', freq: 770 },
    { num: '6', letters: 'MNO', freq: 852 },
    { num: '7', letters: 'PQRS', freq: 697 },
    { num: '8', letters: 'TUV', freq: 770 },
    { num: '9', letters: 'WXYZ', freq: 852 },
    { num: '*', letters: '', freq: 941 },
    { num: '0', letters: '+', freq: 770 },
    { num: '#', letters: '', freq: 941 }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-none">
      {/* Top Tabs */}
      <div className="flex items-center justify-around py-3 bg-white border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setTab('keypad')}
          className={`pb-1 border-b-2 ${
            tab === 'keypad' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
          }`}
        >
          {t('拨号键盘', 'Tastierino')}
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`pb-1 border-b-2 ${
            tab === 'contacts' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
          }`}
        >
          {t('常用联系人', 'Contatti')}
        </button>
      </div>

      {tab === 'keypad' ? (
        <div className="flex-1 flex flex-col justify-between p-4">
          {/* Dial display */}
          <div className="h-16 flex items-center justify-center text-center px-4">
            <span className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
              {dialedNumber || <span className="text-slate-400 text-base font-sans font-medium">点击下方数字键拨号</span>}
            </span>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto w-full">
            {KEYPAD_BUTTONS.map(btn => (
              <button
                key={btn.num}
                onClick={() => pressDigit(btn.num, btn.freq)}
                className="h-14 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 flex flex-col items-center justify-center text-slate-900 active:scale-95 transition-all shadow-xs"
              >
                <span className="text-2xl font-bold leading-none">{btn.num}</span>
                {btn.letters && (
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">{btn.letters}</span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom call and delete */}
          <div className="flex items-center justify-center gap-8 pt-3 pb-2">
            <div className="w-12" />

            <button
              onClick={() => handleCall()}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Phone size={28} />
            </button>

            <button
              onClick={() => setDialedNumber(prev => prev.slice(0, -1))}
              className="w-12 h-12 rounded-full text-slate-500 hover:text-slate-900 flex items-center justify-center"
            >
              <Delete size={24} />
            </button>
          </div>
        </div>
      ) : (
        /* Contacts List */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 slim-scrollbar touch-scroll">
          {CONTACTS.map(contact => (
            <div
              key={contact.number}
              onClick={() => handleCall(contact.number)}
              className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500/40 cursor-pointer active:scale-98 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                  <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">{contact.number}</p>
                </div>
              </div>

              <button className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200">
                <PhoneCall size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
