import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { numberToChineseFinancial } from '../utils/numberToChinese';
import { sound } from '../utils/sound';
import { History, Delete, Copy, Check, ArrowRightLeft, Calculator as CalcIcon } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const { t, showToast } = usePhone();

  const [activeTab, setActiveTab] = useState<'calc' | 'convert'>('calc');

  // Calculator State
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>(['128 + 256 = 384', '5000 * 0.2 = 1000']);
  const [showHistory, setShowHistory] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Converter State (EUR <-> CNY / Renminbi, km <-> mi, kg <-> lb)
  const [convertType, setConvertType] = useState<'currency' | 'length' | 'weight'>('currency');
  const [convertVal, setConvertVal] = useState('100');

  const chineseCapAmount = numberToChineseFinancial(display);

  const inputDigit = (digit: string) => {
    sound.playTap();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    sound.playTap();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    sound.playTap();
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const deleteLastChar = () => {
    sound.playTap();
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    sound.playTap();
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  };

  const inputPercent = () => {
    sound.playTap();
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
    }
  };

  const performOperation = (nextOp: string) => {
    sound.playTap();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operator === '+') newValue = currentValue + inputValue;
      else if (operator === '-') newValue = currentValue - inputValue;
      else if (operator === '×') newValue = currentValue * inputValue;
      else if (operator === '÷') newValue = inputValue !== 0 ? currentValue / inputValue : 0;

      const record = `${currentValue} ${operator} ${inputValue} = ${newValue}`;
      setHistory(prev => [record, ...prev].slice(0, 15));
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  const handleEquals = () => {
    sound.playSuccess();
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      let newValue = prevValue;
      if (operator === '+') newValue = prevValue + inputValue;
      else if (operator === '-') newValue = prevValue - inputValue;
      else if (operator === '×') newValue = prevValue * inputValue;
      else if (operator === '÷') newValue = inputValue !== 0 ? prevValue / inputValue : 0;

      const record = `${prevValue} ${operator} ${inputValue} = ${newValue}`;
      setHistory(prev => [record, ...prev].slice(0, 15));
      setDisplay(String(newValue));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${display} (${chineseCapAmount})`);
    setIsCopied(true);
    showToast('计算结果与中文大写金额已复制');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Convert math
  const numInput = parseFloat(convertVal) || 0;
  let convertedResult = '';
  let unitFrom = '';
  let unitTo = '';

  if (convertType === 'currency') {
    // 1 EUR = approx 7.82 CNY
    unitFrom = '欧元 (EUR €)';
    unitTo = '人民币 (CNY ¥)';
    convertedResult = (numInput * 7.82).toFixed(2);
  } else if (convertType === 'length') {
    unitFrom = '公里 (km)';
    unitTo = '英里 (mi)';
    convertedResult = (numInput * 0.621371).toFixed(2);
  } else {
    unitFrom = '公斤 (kg)';
    unitTo = '磅 (lb)';
    convertedResult = (numInput * 2.20462).toFixed(2);
  }

  return (
    <div className="flex flex-col h-full bg-[#fbf9f4] text-stone-900 select-none">
      {/* Top utility tab bar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5 bg-[#f4ece1] border-b border-stone-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'calc'
                ? 'bg-red-700 text-white'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <CalcIcon size={14} />
            <span>计算</span>
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'convert'
                ? 'bg-red-700 text-white'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <ArrowRightLeft size={14} />
            <span>换算</span>
          </button>
        </div>

        {activeTab === 'calc' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              title="复制结果"
              className="p-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              {isCopied ? <Check size={16} className="text-emerald-700 font-bold" /> : <Copy size={16} />}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1 rounded-lg transition-colors ${
                showHistory ? 'text-red-800 bg-red-100' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <History size={16} />
            </button>
          </div>
        )}
      </div>

      {activeTab === 'calc' ? (
        <>
          {/* Screen Display - Refined & Crisp */}
          <div className="px-4 py-3 flex-1 flex flex-col justify-end text-right bg-transparent">
            {operator && prevValue !== null && (
              <div className="text-xs text-stone-500 font-mono font-bold mb-0.5">
                {prevValue} {operator}
              </div>
            )}

            {/* Main Number Display */}
            <div className="text-4xl font-light tracking-tight font-mono text-stone-900 overflow-x-auto no-scrollbar py-0.5">
              {display}
            </div>

            {/* Chinese Financial Capitalized Display (大写金额) */}
            <div className="text-xs text-red-800 font-bold tracking-wide mt-1 truncate">
              {chineseCapAmount}
            </div>
          </div>

          {/* History Drawer overlay */}
          {showHistory && (
            <div className="h-36 bg-[#f4ece1] border-t border-stone-300 p-2.5 overflow-y-auto slim-scrollbar animate-in slide-in-from-bottom-3 shadow-md">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-200 text-xs text-stone-600 font-bold">
                <span>{t('历史计算记录', 'Cronologia')}</span>
                <button
                  onClick={() => setHistory([])}
                  className="text-red-700 hover:underline"
                >
                  {t('清空记录', 'Cancella')}
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-3">暂无历史记录</p>
              ) : (
                <div className="space-y-1 font-mono text-xs font-semibold">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const res = item.split('=')[1]?.trim();
                        if (res) setDisplay(res);
                      }}
                      className="p-1 rounded-md hover:bg-stone-200 text-stone-800 cursor-pointer flex justify-between"
                    >
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Keypad - Spacious, Large Flagship Calculator Buttons */}
          <div className="p-3 bg-[#f4ece1]/95 rounded-t-3xl border-t border-stone-200 grid grid-cols-4 gap-2.5 pb-4 shadow-sm">
            <button
              onClick={clearAll}
              className="h-13 sm:h-14 rounded-2xl bg-red-100 text-red-900 font-bold text-base sm:text-lg hover:bg-red-200 active:scale-95 transition-transform"
            >
              AC
            </button>
            <button
              onClick={toggleSign}
              className="h-13 sm:h-14 rounded-2xl bg-stone-100 text-stone-900 font-bold text-base sm:text-lg hover:bg-stone-200 active:scale-95 transition-transform border border-stone-200"
            >
              ±
            </button>
            <button
              onClick={inputPercent}
              className="h-13 sm:h-14 rounded-2xl bg-stone-100 text-stone-900 font-bold text-base sm:text-lg hover:bg-stone-200 active:scale-95 transition-transform border border-stone-200"
            >
              %
            </button>
            <button
              onClick={() => performOperation('÷')}
              className={`h-13 sm:h-14 rounded-2xl font-bold text-xl active:scale-95 transition-transform ${
                operator === '÷'
                  ? 'bg-red-900 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-2xs'
              }`}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => inputDigit('7')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              7
            </button>
            <button
              onClick={() => inputDigit('8')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              8
            </button>
            <button
              onClick={() => inputDigit('9')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              9
            </button>
            <button
              onClick={() => performOperation('×')}
              className={`h-13 sm:h-14 rounded-2xl font-bold text-xl active:scale-95 transition-transform ${
                operator === '×'
                  ? 'bg-red-900 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-2xs'
              }`}
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => inputDigit('4')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              4
            </button>
            <button
              onClick={() => inputDigit('5')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              5
            </button>
            <button
              onClick={() => inputDigit('6')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              6
            </button>
            <button
              onClick={() => performOperation('-')}
              className={`h-13 sm:h-14 rounded-2xl font-bold text-xl active:scale-95 transition-transform ${
                operator === '-'
                  ? 'bg-red-900 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-2xs'
              }`}
            >
              -
            </button>

            {/* Row 4 */}
            <button
              onClick={() => inputDigit('1')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              1
            </button>
            <button
              onClick={() => inputDigit('2')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              2
            </button>
            <button
              onClick={() => inputDigit('3')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              3
            </button>
            <button
              onClick={() => performOperation('+')}
              className={`h-13 sm:h-14 rounded-2xl font-bold text-xl active:scale-95 transition-transform ${
                operator === '+'
                  ? 'bg-red-900 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-2xs'
              }`}
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => inputDigit('0')}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              0
            </button>
            <button
              onClick={inputDot}
              className="h-13 sm:h-14 rounded-2xl bg-white text-stone-900 font-bold text-lg sm:text-xl hover:bg-stone-100 active:scale-95 transition-transform shadow-2xs border border-stone-200"
            >
              .
            </button>
            <button
              onClick={deleteLastChar}
              className="h-13 sm:h-14 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform border border-stone-200"
            >
              <Delete size={20} />
            </button>
            <button
              onClick={handleEquals}
              className="h-13 sm:h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xl shadow-xs active:scale-95 transition-transform"
            >
              =
            </button>
          </div>
        </>
      ) : (
        /* Converter Mode (换算模式: 汇率、长度、重量) */
        <div className="flex-1 p-3.5 space-y-3 overflow-y-auto slim-scrollbar">
          {/* Converter type selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200 rounded-xl text-xs font-bold text-center">
            <button
              onClick={() => setConvertType('currency')}
              className={`py-1.5 rounded-lg transition-colors ${
                convertType === 'currency' ? 'bg-white text-red-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              汇率 (EUR/CNY)
            </button>
            <button
              onClick={() => setConvertType('length')}
              className={`py-1.5 rounded-lg transition-colors ${
                convertType === 'length' ? 'bg-white text-red-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              长度 (km/mi)
            </button>
            <button
              onClick={() => setConvertType('weight')}
              className={`py-1.5 rounded-lg transition-colors ${
                convertType === 'weight' ? 'bg-white text-red-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              重量 (kg/lb)
            </button>
          </div>

          {/* Input Card */}
          <div className="p-3 bg-white border border-stone-300 rounded-2xl shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-stone-500">{unitFrom}</div>
            <input
              type="number"
              value={convertVal}
              onChange={e => setConvertVal(e.target.value)}
              className="w-full text-2xl font-mono font-bold text-stone-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowRightLeft size={18} className="text-red-700" />
          </div>

          {/* Result Card */}
          <div className="p-3 bg-[#f5ede3] border border-stone-300 rounded-2xl shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-red-800">{unitTo}</div>
            <div className="text-3xl font-mono font-bold text-stone-900">
              {convertedResult}
            </div>
            {convertType === 'currency' && (
              <div className="text-[10px] text-stone-500 font-serif pt-1">
                当前参考汇率：1 欧元 ≈ 7.82 人民币元
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
