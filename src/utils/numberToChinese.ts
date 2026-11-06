/**
 * Converts numbers into traditional Chinese Financial Capitalized Form (大写数字)
 * e.g., 125.50 -> 壹佰贰拾伍元伍角
 */

const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const UNITS = ['', '拾', '佰', '仟'];
const BIG_UNITS = ['', '万', '亿', '兆'];

export function numberToChineseFinancial(num: number | string): string {
  if (num === '' || num === null || num === undefined) return '零元整';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '无效数值';
  if (n === 0) return '零元整';

  const isNegative = n < 0;
  const absNum = Math.abs(n);

  const [intPartStr, decPartStr = ''] = absNum.toFixed(2).split('.');
  const intPart = parseInt(intPartStr, 10);

  let chineseInt = '';
  if (intPart === 0) {
    chineseInt = '零';
  } else {
    // Process in chunks of 4 digits (万, 亿...)
    const str = intPart.toString();
    const len = str.length;
    let sectionCount = Math.ceil(len / 4);

    for (let i = 0; i < sectionCount; i++) {
      const sectionLen = (len % 4 === 0) ? 4 : (len % 4);
      const start = i === 0 ? 0 : sectionLen + (i - 1) * 4;
      const end = i === 0 ? sectionLen : start + 4;
      const section = str.substring(start, end);

      let sectionChinese = '';
      let zeroFlag = false;

      for (let j = 0; j < section.length; j++) {
        const digit = parseInt(section[j], 10);
        const unit = UNITS[section.length - 1 - j];

        if (digit === 0) {
          zeroFlag = true;
        } else {
          if (zeroFlag) {
            sectionChinese += '零';
            zeroFlag = false;
          }
          sectionChinese += DIGITS[digit] + unit;
        }
      }

      if (sectionChinese !== '') {
        const bigUnit = BIG_UNITS[sectionCount - 1 - i];
        chineseInt += sectionChinese + bigUnit;
      }
    }
  }

  // Decimals (角, 分)
  let chineseDec = '';
  const jiao = parseInt(decPartStr[0] || '0', 10);
  const fen = parseInt(decPartStr[1] || '0', 10);

  if (jiao === 0 && fen === 0) {
    chineseDec = '整';
  } else {
    if (jiao !== 0) {
      chineseDec += DIGITS[jiao] + '角';
    } else if (intPart !== 0 && fen !== 0) {
      chineseDec += '零';
    }
    if (fen !== 0) {
      chineseDec += DIGITS[fen] + '分';
    }
  }

  const prefix = isNegative ? '负 ' : '';
  return `${prefix}${chineseInt}元${chineseDec}`;
}

export function digitToChineseDigit(char: string): string {
  const map: Record<string, string> = {
    '0': '零',
    '1': '壹',
    '2': '贰',
    '3': '叁',
    '4': '肆',
    '5': '伍',
    '6': '陆',
    '7': '柒',
    '8': '捌',
    '9': '玖',
    '.': '点',
    '+': '加',
    '-': '减',
    '*': '乘',
    '/': '除',
  };
  return map[char] || char;
}
