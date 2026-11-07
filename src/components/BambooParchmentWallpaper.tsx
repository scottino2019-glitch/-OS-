import React from 'react';

export type WallpaperThemeKey =
  | 'bamboo_parchment'
  | 'mountains_shanshui'
  | 'porcelain_blue'
  | 'lacquer_gold'
  | 'imperial_crimson';

interface BambooWallpaperProps {
  className?: string;
  theme?: string;
}

/**
 * BambooParchmentWallpaper
 * Masterful authentic Chinese wallpapers:
 * 1. bamboo_parchment: User's exact ink-wash bamboo painting & red seal stamp on warm antique parchment.
 * 2. mountains_shanshui: Iconic Qinglü Shan Shui (千里江山) blue-green imperial landscape with misty peaks & cranes.
 * 3. porcelain_blue: Ming dynasty blue and white porcelain (青花瓷) glaze with cobalt bamboo & floral motifs.
 * 4. lacquer_gold: Midnight black lacquer (黑漆描金) with radiant metallic gold bamboo stalks & cinnabar seal.
 * 5. imperial_crimson: Forbidden City vermilion silk (朱红御锦) with royal dragon cloud watermarks & golden crest.
 */
export const BambooParchmentWallpaper: React.FC<BambooWallpaperProps> = ({
  className = '',
  theme = 'bamboo_parchment'
}) => {
  // Robust theme normalization supporting both IDs ('bamboo_jade') and theme keywords ('jade')
  const t = (theme || '').toLowerCase();
  let activeTheme: WallpaperThemeKey = 'bamboo_parchment';
  if (t.includes('porcelain') || t.includes('blue')) {
    activeTheme = 'porcelain_blue';
  } else if (t.includes('lacquer') || t.includes('gold') || t.includes('black')) {
    activeTheme = 'lacquer_gold';
  } else if (t.includes('crimson') || t.includes('red') || t.includes('imperial')) {
    activeTheme = 'imperial_crimson';
  } else if (t.includes('mountain') || t.includes('shanshui') || t.includes('jade')) {
    activeTheme = 'mountains_shanshui';
  } else {
    activeTheme = 'bamboo_parchment';
  }

  return (
    <div className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}>
      {/* ================= 1. BAMBOO PARCHMENT (清竹古卷 · 水墨甲骨文) ================= */}
      {activeTheme === 'bamboo_parchment' && (
        <>
          {/* Rich Antique Parchment Background (Warm, textured, non-washed-out) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(168deg, #ebd6b5 0%, #d8be92 40%, #c8ab76 80%, #b8975e 100%)'
            }}
          />
          {/* Parchment Aging Vignette & Fiber Depth */}
          <div
            className="absolute inset-0 opacity-45 mix-blend-multiply"
            style={{
              background: `
                radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(95, 60, 25, 0.5) 100%),
                radial-gradient(circle at 15% 15%, rgba(135, 85, 35, 0.25) 0%, transparent 45%),
                radial-gradient(circle at 85% 85%, rgba(110, 70, 25, 0.3) 0%, transparent 50%)
              `
            }}
          />

          {/* User's Exact Bamboo Painting & Ancient Chinese Pictograms */}
          <svg
            viewBox="0 0 380 720"
            className="absolute inset-0 w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Ancient Oracle Bone & Seal Script Pictograms (甲骨文 / 篆书图腾) */}
            <g fill="rgba(80, 52, 28, 0.28)" fontFamily="'Noto Serif SC', 'Songti SC', serif">
              {/* Pictogram 1: 竹 (Ancient Bamboo Stems Pictogram) */}
              <text x="35" y="150" fontSize="28" fontWeight="bold">
                𠂹
              </text>
              <text x="45" y="180" fontSize="11" letterSpacing="2" opacity="0.8">
                古篆·竹
              </text>

              {/* Pictogram 2: 山 (Ancient Mountain Trigrams) */}
              <text x="320" y="160" fontSize="26" fontWeight="bold">
                山
              </text>

              {/* Pictogram 3: 水 (Flowing Water Pictogram) */}
              <text x="315" y="340" fontSize="26" fontWeight="bold">
                水
              </text>

              {/* Pictogram 4: 风 (Wind / Spirit Pictogram) */}
              <text x="32" y="440" fontSize="24" fontWeight="bold">
                風
              </text>

              {/* Classical Zheng Banqiao Bamboo Poem Calligraphy */}
              <g writingMode="vertical-rl" fontSize="13" letterSpacing="7" fontWeight="bold" opacity="0.85">
                <text x="24" y="220">咬定青山不放松</text>
                <text x="46" y="240">立根原在破岩中</text>
                <text x="68" y="265" fontSize="11" opacity="0.75">千磨万击还坚劲</text>
                <text x="88" y="295" fontSize="11" opacity="0.75">任尔东西南北风</text>
              </g>
            </g>

            {/* Main Bamboo Stalks (Crisp, deep obsidian sumi ink #12100e - PROMINENT & BOLD) */}
            <g fill="none" stroke="#12100e" strokeLinecap="round">
              {/* Left Main Stalk */}
              <path d="M 120,730 Q 112,580 122,480" strokeWidth="10" opacity="0.98" />
              <path d="M 123,476 Q 132,370 137,275" strokeWidth="8.5" opacity="0.98" />
              <path d="M 138,271 Q 146,170 150,95" strokeWidth="7" opacity="0.95" />
              <path d="M 151,91 Q 157,45 160,15" strokeWidth="5" opacity="0.9" />

              {/* Right Secondary Stalk */}
              <path d="M 235,730 Q 242,595 233,492" strokeWidth="11" opacity="0.98" />
              <path d="M 232,488 Q 224,380 231,285" strokeWidth="9.5" opacity="0.98" />
              <path d="M 232,281 Q 239,180 242,105" strokeWidth="7.5" opacity="0.95" />
              <path d="M 243,101 Q 247,50 250,18" strokeWidth="5.5" opacity="0.9" />

              {/* Bamboo Joint Rings (Nodes) */}
              <ellipse cx="122" cy="478" rx="10" ry="3.5" fill="#12100e" />
              <ellipse cx="137" cy="273" rx="9" ry="3" fill="#12100e" />
              <ellipse cx="150" cy="93" rx="7.5" ry="2.5" fill="#12100e" />

              <ellipse cx="233" cy="490" rx="11" ry="3.8" fill="#12100e" />
              <ellipse cx="231" cy="283" rx="10" ry="3.2" fill="#12100e" />
              <ellipse cx="242" cy="103" rx="8.5" ry="2.8" fill="#12100e" />
            </g>

            {/* Bamboo Leaves (High-contrast sweeping brush strokes) */}
            <g fill="#12100e" opacity="0.98">
              {/* Lower Cluster Left */}
              <path d="M 122,478 Q 75,466 38,485 Q 80,480 122,478 Z" />
              <path d="M 122,478 Q 70,496 30,526 Q 74,505 122,478 Z" />
              <path d="M 122,478 Q 84,520 52,556 Q 88,526 122,478 Z" />
              <path d="M 122,478 Q 156,460 192,472 Q 154,472 122,478 Z" />

              {/* Lower Cluster Right */}
              <path d="M 233,490 Q 285,472 342,490 Q 284,485 233,490 Z" />
              <path d="M 233,490 Q 280,508 324,538 Q 274,516 233,490 Z" />
              <path d="M 233,490 Q 268,532 294,580 Q 260,536 233,490 Z" />
              <path d="M 233,490 Q 190,462 150,458 Q 192,476 233,490 Z" />

              {/* Mid Cluster Left */}
              <path d="M 137,273 Q 88,256 44,275 Q 92,269 137,273 Z" />
              <path d="M 137,273 Q 94,295 54,324 Q 100,298 137,273 Z" />
              <path d="M 137,273 Q 108,318 76,358 Q 112,324 137,273 Z" />
              <path d="M 137,273 Q 166,240 206,228 Q 168,252 137,273 Z" />
              <path d="M 137,273 Q 178,258 220,268 Q 176,272 137,273 Z" />

              {/* Mid Cluster Right */}
              <path d="M 231,283 Q 284,260 340,276 Q 282,274 231,283 Z" />
              <path d="M 231,283 Q 288,290 350,308 Q 284,296 231,283 Z" />
              <path d="M 231,283 Q 278,312 312,350 Q 268,320 231,283 Z" />
              <path d="M 231,283 Q 194,248 154,238 Q 196,260 231,283 Z" />

              {/* Upper Cluster Left */}
              <path d="M 150,93 Q 100,74 56,92 Q 104,86 150,93 Z" />
              <path d="M 150,93 Q 112,114 70,138 Q 118,118 150,93 Z" />
              <path d="M 150,93 Q 174,60 212,46 Q 174,74 150,93 Z" />
              <path d="M 150,93 Q 182,84 225,95 Q 180,94 150,93 Z" />

              {/* Upper Cluster Right */}
              <path d="M 242,103 Q 294,80 350,96 Q 292,94 242,103 Z" />
              <path d="M 242,103 Q 296,110 355,128 Q 292,114 242,103 Z" />
              <path d="M 242,103 Q 204,66 170,58 Q 208,80 242,103 Z" />

              {/* Crown Tips */}
              <path d="M 160,15 Q 116,4 82,18 Q 122,15 160,15 Z" />
              <path d="M 160,15 Q 186,4 222,8 Q 184,16 160,15 Z" />
              <path d="M 250,18 Q 302,6 350,16 Q 300,18 250,18 Z" />
              <path d="M 250,18 Q 278,32 318,50 Q 278,36 250,18 Z" />
            </g>

            {/* Traditional Red Square Cinnabar Seal Stamp: "清竹" */}
            <g>
              <rect x="296" y="405" width="58" height="58" fill="#C92A2A" rx="6" />
              <rect x="300" y="409" width="50" height="50" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.95" rx="4" />
              <text x="325" y="443" fontFamily="'Noto Serif SC', 'Songti SC', serif" fontSize="24" fill="#FFFFFF" textAnchor="middle" fontWeight="bold" letterSpacing="2">
                清竹
              </text>
            </g>

            {/* Upper Seal Stamp: "吉祥" */}
            <g>
              <rect x="22" y="60" width="36" height="48" fill="#A8201A" rx="4" />
              <rect x="24.5" y="62.5" width="31" height="43" fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.9" rx="2.5" />
              <text x="40" y="84" fontFamily="'Noto Serif SC', 'Songti SC', serif" fontSize="14" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                吉
              </text>
              <text x="40" y="101" fontFamily="'Noto Serif SC', 'Songti SC', serif" fontSize="14" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                祥
              </text>
            </g>
          </svg>
        </>
      )}

      {/* ================= 2. MOUNTAINS SHANSHUI (千里江山 · 青绿山水) ================= */}
      {activeTheme === 'mountains_shanshui' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #f7f3e8 0%, #e2ecd9 30%, #a7cbb0 65%, #2a6152 100%)'
            }}
          />
          <svg viewBox="0 0 380 720" className="absolute inset-0 w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Distant Golden Sun */}
            <circle cx="280" cy="140" r="38" fill="#f59e0b" opacity="0.75" />

            {/* Distant Mountain Silhouettes in Soft Mineral Blue */}
            <path d="M -20,380 Q 80,240 180,310 Q 280,220 400,320 L 400,720 L -20,720 Z" fill="#4d7c71" opacity="0.6" />
            <path d="M 0,430 Q 120,290 240,360 Q 330,300 420,410 L 420,720 L 0,720 Z" fill="#2d5e53" opacity="0.75" />

            {/* Foreground Jade Mountain Peaks */}
            <path d="M -20,490 Q 90,360 210,440 Q 300,380 400,470 L 400,720 L -20,720 Z" fill="#1d4d42" />

            {/* Misty Clouds Ribbon */}
            <path d="M 0,390 Q 100,370 200,410 Q 300,380 400,400 L 400,440 Q 300,410 200,440 Q 100,400 0,420 Z" fill="#f7f3e8" opacity="0.65" />

            {/* Soaring Cranes (白鹤) */}
            <g fill="#1f2937">
              <path d="M 120,180 Q 130,174 140,178 Q 132,184 120,180 Z M 130,174 Q 132,165 138,168 Z" />
              <path d="M 150,155 Q 158,150 166,153 Q 160,158 150,155 Z" />
              <path d="M 100,205 Q 108,200 116,203 Q 110,208 100,205 Z" />
            </g>

            {/* Inscription & Seal */}
            <g fill="rgba(247, 243, 232, 0.9)" fontFamily="'Noto Serif SC', serif">
              <text x="32" y="100" fontSize="15" letterSpacing="6" writingMode="vertical-rl" fontWeight="bold">
                千里江山 · 胜概
              </text>
            </g>
            <rect x="290" y="440" width="48" height="48" fill="#B91C1C" rx="4" />
            <rect x="293" y="443" width="42" height="42" fill="none" stroke="#FDE68A" strokeWidth="1.2" rx="3" />
            <text x="314" y="470" fontFamily="serif" fontSize="18" fill="#FDE68A" textAnchor="middle" fontWeight="bold">
              御览
            </text>
          </svg>
        </>
      )}

      {/* ================= 3. PORCELAIN BLUE (青花瓷韵 · 国风雅鉴) ================= */}
      {activeTheme === 'porcelain_blue' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(175deg, #ffffff 0%, #f1f7fe 45%, #e1effe 85%, #d1e5fc 100%)'
            }}
          />
          <svg viewBox="0 0 380 720" className="absolute inset-0 w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Top Ornamental Porcelain Border */}
            <g fill="none" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.65">
              <path d="M 0,25 Q 95,45 190,25 Q 285,45 380,25" />
              <path d="M 0,32 Q 95,52 190,32 Q 285,52 380,32" strokeWidth="1" />
            </g>

            {/* Cobalt Blue Bamboo Stalks */}
            <g fill="none" stroke="#1e40af" strokeLinecap="round">
              <path d="M 130,730 Q 120,560 135,460 Q 145,360 152,260 Q 158,160 162,30" strokeWidth="8" opacity="0.95" />
              <path d="M 240,730 Q 248,580 240,470 Q 232,360 238,250 Q 244,150 248,35" strokeWidth="8.5" opacity="0.95" />
              <ellipse cx="135" cy="460" rx="8" ry="3" fill="#1e40af" />
              <ellipse cx="152" cy="260" rx="7" ry="2.5" fill="#1e40af" />
              <ellipse cx="240" cy="470" rx="9" ry="3" fill="#1e40af" />
              <ellipse cx="238" cy="250" rx="8" ry="2.8" fill="#1e40af" />
            </g>

            {/* Cobalt Leaves */}
            <g fill="#1d4ed8" opacity="0.9">
              <path d="M 135,460 Q 80,446 35,470 Q 86,462 135,460 Z" />
              <path d="M 135,460 Q 75,480 30,515 Q 80,490 135,460 Z" />
              <path d="M 152,260 Q 95,242 45,264 Q 100,255 152,260 Z" />
              <path d="M 152,260 Q 185,225 230,210 Q 185,240 152,260 Z" />
              <path d="M 240,470 Q 295,450 355,472 Q 295,465 240,470 Z" />
              <path d="M 240,470 Q 290,490 338,525 Q 285,500 240,470 Z" />
              <path d="M 238,250 Q 295,225 352,242 Q 292,240 238,250 Z" />
              <path d="M 238,250 Q 195,215 155,205 Q 198,228 238,250 Z" />
            </g>

            {/* Royal Cobalt Seal */}
            <g>
              <rect x="296" y="420" width="52" height="52" fill="#1e3a8a" rx="5" />
              <rect x="299.5" y="423.5" width="45" height="45" fill="none" stroke="#eff6ff" strokeWidth="1.4" rx="3.5" />
              <text x="322" y="455" fontFamily="serif" fontSize="22" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                青花
              </text>
            </g>
          </svg>
        </>
      )}

      {/* ================= 4. LACQUER GOLD (黑金玄漆 · 傲雪寒竹) ================= */}
      {activeTheme === 'lacquer_gold' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(175deg, #1f1c19 0%, #12100e 45%, #080706 85%, #000000 100%)'
            }}
          />
          <svg viewBox="0 0 380 720" className="absolute inset-0 w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Golden Star & Dust Flecks */}
            <circle cx="80" cy="180" r="1.5" fill="#fef08a" opacity="0.6" />
            <circle cx="280" cy="140" r="2" fill="#fef08a" opacity="0.8" />
            <circle cx="320" cy="260" r="1.2" fill="#fef08a" opacity="0.5" />
            <circle cx="60" cy="360" r="1.8" fill="#fef08a" opacity="0.6" />

            {/* Metallic Golden Bamboo Stalks */}
            <g fill="none" stroke="#d4af37" strokeLinecap="round">
              <path d="M 125,730 Q 115,570 128,470 Q 138,370 144,270 Q 150,170 155,30" strokeWidth="8" opacity="0.95" />
              <path d="M 235,730 Q 244,580 236,470 Q 228,360 234,250 Q 240,150 244,35" strokeWidth="8.5" opacity="0.95" />
              <ellipse cx="128" cy="470" rx="8" ry="3" fill="#eab308" />
              <ellipse cx="144" cy="270" rx="7" ry="2.5" fill="#eab308" />
              <ellipse cx="236" cy="470" rx="9" ry="3" fill="#eab308" />
              <ellipse cx="234" cy="250" rx="8" ry="2.8" fill="#eab308" />
            </g>

            {/* Glowing Golden Leaves */}
            <g fill="#f59e0b" opacity="0.92">
              <path d="M 128,470 Q 75,456 30,480 Q 80,472 128,470 Z" />
              <path d="M 128,470 Q 70,490 25,525 Q 75,500 128,470 Z" />
              <path d="M 144,270 Q 90,252 40,274 Q 95,265 144,270 Z" />
              <path d="M 144,270 Q 180,235 224,220 Q 180,250 144,270 Z" />
              <path d="M 236,470 Q 290,450 350,472 Q 290,465 236,470 Z" />
              <path d="M 236,470 Q 285,490 332,525 Q 280,500 236,470 Z" />
              <path d="M 234,250 Q 290,225 348,242 Q 288,240 234,250 Z" />
            </g>

            {/* Glowing Red Lacquer Seal */}
            <g>
              <rect x="296" y="420" width="52" height="52" fill="#DC2626" rx="5" />
              <rect x="299.5" y="423.5" width="45" height="45" fill="none" stroke="#FEE2E2" strokeWidth="1.4" rx="3.5" />
              <text x="322" y="455" fontFamily="serif" fontSize="22" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                玄漆
              </text>
            </g>
          </svg>
        </>
      )}

      {/* ================= 5. IMPERIAL CRIMSON (朱砂御令 · 紫禁红墙) ================= */}
      {activeTheme === 'imperial_crimson' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(175deg, #a8201a 0%, #851812 45%, #600f0a 85%, #420805 100%)'
            }}
          />
          <svg viewBox="0 0 380 720" className="absolute inset-0 w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Imperial Cloud Crest (祥云纹) */}
            <g fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3">
              <path d="M 40,120 Q 60,100 80,120 Q 100,100 120,120 Q 80,150 40,120 Z" />
              <path d="M 260,200 Q 280,180 300,200 Q 320,180 340,200 Q 300,230 260,200 Z" />
            </g>

            {/* Silvery/Gold Bamboo Stalks */}
            <g fill="none" stroke="#fef08a" strokeLinecap="round">
              <path d="M 125,730 Q 115,570 128,470 Q 138,370 144,270 Q 150,170 155,30" strokeWidth="8" opacity="0.9" />
              <path d="M 235,730 Q 244,580 236,470 Q 228,360 234,250 Q 240,150 244,35" strokeWidth="8.5" opacity="0.9" />
              <ellipse cx="128" cy="470" rx="8" ry="3" fill="#fde047" />
              <ellipse cx="144" cy="270" rx="7" ry="2.5" fill="#fde047" />
              <ellipse cx="236" cy="470" rx="9" ry="3" fill="#fde047" />
              <ellipse cx="234" cy="250" rx="8" ry="2.8" fill="#fde047" />
            </g>

            {/* Silvery Leaves */}
            <g fill="#fefce8" opacity="0.92">
              <path d="M 128,470 Q 75,456 30,480 Q 80,472 128,470 Z" />
              <path d="M 128,470 Q 70,490 25,525 Q 75,500 128,470 Z" />
              <path d="M 144,270 Q 90,252 40,274 Q 95,265 144,270 Z" />
              <path d="M 236,470 Q 290,450 350,472 Q 290,465 236,470 Z" />
              <path d="M 234,250 Q 290,225 348,242 Q 288,240 234,250 Z" />
            </g>

            {/* Imperial Gold Seal */}
            <g>
              <rect x="296" y="420" width="52" height="52" fill="#F59E0B" rx="5" />
              <rect x="299.5" y="423.5" width="45" height="45" fill="none" stroke="#FEF3C7" strokeWidth="1.4" rx="3.5" />
              <text x="322" y="455" fontFamily="serif" fontSize="22" fill="#78350F" textAnchor="middle" fontWeight="bold">
                御宝
              </text>
            </g>
          </svg>
        </>
      )}
    </div>
  );
};
