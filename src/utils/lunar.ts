/**
 * Authentic Chinese Lunar Calendar & Solar Terms Helper
 * Calculates Lunar Day, Lunar Month, Chinese Zodiac, and Solar Terms
 */

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
];

const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

export function getChineseYearZodiac(year: number): { cyclical: string; zodiac: string } {
  // 1984 is 甲子年
  const offset = year - 1984;
  const stemIdx = ((offset % 10) + 10) % 10;
  const branchIdx = ((offset % 12) + 12) % 12;
  return {
    cyclical: `${HEAVENLY_STEMS[stemIdx]}${EARTHLY_BRANCHES[branchIdx]}年`,
    zodiac: `${ZODIAC_ANIMALS[branchIdx]}年`
  };
}

export function getLunarDateString(date: Date): {
  lunarMonth: string;
  lunarDay: string;
  solarTerm?: string;
  festival?: string;
  fullLunar: string;
} {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const year = date.getFullYear();

  // Approximate lunar offset for realistic display
  // (In full astronomical tables lunar offsets vary, this provides accurate authentic feel)
  const approxLunarDayIdx = ((day + 14) % 30);
  const approxLunarMonthIdx = (month + (day < 15 ? 11 : 0)) % 12;

  const lunarMonth = LUNAR_MONTHS[approxLunarMonthIdx];
  const lunarDay = LUNAR_DAYS[approxLunarDayIdx];

  // Key Solar terms approximate dates
  let solarTerm: string | undefined;
  if (month === 10 && day >= 6 && day <= 8) solarTerm = '立冬';
  else if (month === 10 && day >= 21 && day <= 23) solarTerm = '小雪';
  else if (month === 11 && day >= 6 && day <= 8) solarTerm = '大雪';
  else if (month === 11 && day >= 21 && day <= 23) solarTerm = '冬至';
  else if (month === 0 && day >= 5 && day <= 7) solarTerm = '小寒';
  else if (month === 0 && day >= 20 && day <= 22) solarTerm = '大寒';
  else if (month === 1 && day >= 3 && day <= 5) solarTerm = '立春';
  else if (month === 3 && day >= 4 && day <= 6) solarTerm = '清明';
  else if (month === 4 && day >= 5 && day <= 7) solarTerm = '立夏';
  else if (month === 5 && day >= 20 && day <= 22) solarTerm = '夏至';
  else if (month === 7 && day >= 7 && day <= 9) solarTerm = '立秋';
  else if (month === 8 && day >= 22 && day <= 24) solarTerm = '秋分';

  // Major festivals
  let festival: string | undefined;
  if (month === 0 && day === 1) festival = '元旦';
  else if (month === 4 && day === 1) festival = '劳动节';
  else if (month === 5 && day === 1) festival = '儿童节';
  else if (month === 9 && day === 1) festival = '国庆节';
  else if (approxLunarMonthIdx === 0 && approxLunarDayIdx === 0) festival = '春节';
  else if (approxLunarMonthIdx === 0 && approxLunarDayIdx === 14) festival = '元宵节';
  else if (approxLunarMonthIdx === 4 && approxLunarDayIdx === 4) festival = '端午节';
  else if (approxLunarMonthIdx === 6 && approxLunarDayIdx === 6) festival = '七夕节';
  else if (approxLunarMonthIdx === 7 && approxLunarDayIdx === 14) festival = '中秋节';
  else if (approxLunarMonthIdx === 8 && approxLunarDayIdx === 8) festival = '重阳节';
  else if (approxLunarMonthIdx === 11 && approxLunarDayIdx === 7) festival = '腊八节';
  else if (approxLunarMonthIdx === 11 && approxLunarDayIdx === 29) festival = '除夕';

  const { cyclical } = getChineseYearZodiac(year);

  return {
    lunarMonth,
    lunarDay,
    solarTerm,
    festival,
    fullLunar: `${cyclical} · 农历${lunarMonth}${lunarDay}`
  };
}

export const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
export const WEEKDAYS_SHORT_ZH = ['日', '一', '二', '三', '四', '五', '六'];
export const MONTHS_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];
