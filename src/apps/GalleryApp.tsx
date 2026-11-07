import React, { useState, useRef, useEffect } from 'react';
import { usePhone } from '../context/PhoneContext';
import { Photo } from '../types/phone';
import { sound } from '../utils/sound';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  ChevronLeft,
  Upload,
  Sliders,
  RotateCw,
  FlipHorizontal,
  Download,
  Check,
  X,
  Type,
  Sun,
  Contrast,
  RefreshCw,
  SwitchCamera
} from 'lucide-react';

const CAMERA_WATERMARKS = [
  'AURORA 16 · 徕卡联合研发 | 50mm f/1.4 OIS',
  '极光影像 · 蔡司 T* 镀膜 镜头',
  'HUAZHI OPTICS · 50MP PRO SENSOR'
];

interface FilterPreset {
  name: string;
  nameIt: string;
  css: string;
  tag: string;
}

const FILTERS: FilterPreset[] = [
  { name: '原图', nameIt: 'Originale', css: 'none', tag: 'Std' },
  { name: '赛博', nameIt: 'Cyberpunk', css: 'contrast(125%) saturate(140%) hue-rotate(15deg)', tag: 'Neon' },
  { name: '胶片', nameIt: 'Pellicola', css: 'sepia(30%) contrast(110%) brightness(95%)', tag: 'Retro' },
  { name: '黑白', nameIt: 'Bianco & Nero', css: 'grayscale(100%) contrast(130%)', tag: 'B&W' },
  { name: '清新', nameIt: 'Fresco', css: 'brightness(110%) saturate(85%) contrast(90%)', tag: 'Fresh' },
  { name: '暖阳', nameIt: 'Caldo', css: 'sepia(25%) saturate(130%) brightness(105%)', tag: 'Warm' },
  { name: '冷翠', nameIt: 'Smeraldo', css: 'hue-rotate(-20deg) saturate(115%) contrast(105%)', tag: 'Cool' }
];

export const GalleryApp: React.FC = () => {
  const { photos, addPhoto, updatePhoto, deletePhoto, updateSettings, t, showToast } = usePhone();

  const [mode, setMode] = useState<'gallery' | 'camera'>('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Live Camera State
  const [cameraFilterIdx, setCameraFilterIdx] = useState(0);
  const [cameraWatermarkIdx, setCameraWatermarkIdx] = useState(0);
  const [cameraWatermarkEnabled, setCameraWatermarkEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Photo Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<'filters' | 'adjust' | 'transform' | 'watermark'>('filters');
  const [editFilterIdx, setEditFilterIdx] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [editWatermarkIdx, setEditWatermarkIdx] = useState(0);
  const [isProcessingSave, setIsProcessingSave] = useState(false);

  // Initialize or reset editor state when editing a photo
  const openEditor = (photo: Photo) => {
    sound.playTap();
    setEditFilterIdx(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setRotation(0);
    setFlipH(false);
    setWatermarkEnabled(false);
    setEditWatermarkIdx(0);
    setEditTab('filters');
    setIsEditing(true);
  };

  const closeEditor = () => {
    sound.playTap();
    setIsEditing(false);
  };

  const resetAdjustments = () => {
    sound.playTap();
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setRotation(0);
    setFlipH(false);
    setEditFilterIdx(0);
  };

  // Robust Camera Stream Connection & Cleanup
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    if (mode === 'camera') {
      setIsCameraActive(false);

      const startCamera = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setHasCameraPermission(false);
            return;
          }

          let stream: MediaStream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false
            });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }

          if (isCancelled) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          activeStream = stream;
          setMediaStream(stream);
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                setIsCameraActive(true);
              }).catch(e => console.warn('Video play error:', e));
            };
          }
        } catch (err) {
          console.warn('Camera stream failed:', err);
          if (!isCancelled) {
            setHasCameraPermission(false);
            setMediaStream(null);
            setIsCameraActive(false);
          }
        }
      };

      startCamera();
    } else {
      setMediaStream(null);
      setIsCameraActive(false);
    }

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [mode, facingMode]);

  // Secondary stream attacher in case element renders after stream ready
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().then(() => {
        setIsCameraActive(true);
      }).catch(e => console.warn('Secondary video play error:', e));
    }
  }, [mediaStream]);

  // Combined CSS filter string for live preview
  const getCombinedFilterCss = (presetIdx: number) => {
    const preset = FILTERS[presetIdx];
    const parts: string[] = [];
    if (preset && preset.css !== 'none') {
      parts.push(preset.css);
    }
    if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
    if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
    if (saturation !== 100) parts.push(`saturate(${saturation}%)`);
    if (sepia > 0) parts.push(`sepia(${sepia}%)`);
    return parts.length > 0 ? parts.join(' ') : 'none';
  };

  // Render canvas with all edits baked in
  const generateEditedImageDataUrl = async (): Promise<string | null> => {
    if (!selectedPhoto) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const isSwapped = rotation === 90 || rotation === 270;
        const origW = img.naturalWidth || img.width || 720;
        const origH = img.naturalHeight || img.height || 960;

        const canvas = document.createElement('canvas');
        canvas.width = isSwapped ? origH : origW;
        canvas.height = isSwapped ? origW : origH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Apply filters
        ctx.filter = getCombinedFilterCss(editFilterIdx);

        // Transform (Rotation & Flip)
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
        ctx.restore();

        // Watermark Banner (if enabled)
        if (watermarkEnabled) {
          ctx.filter = 'none';
          const bannerH = Math.max(70, Math.round(canvas.height * 0.085));
          const bannerY = canvas.height - bannerH;

          // White frosted banner
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(0, bannerY, canvas.width, bannerH);

          // Top divider line
          ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
          ctx.fillRect(0, bannerY, canvas.width, 2);

          // Text labels
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold ${Math.max(16, Math.round(bannerH * 0.28))}px system-ui, -apple-system, sans-serif`;
          ctx.fillText(CAMERA_WATERMARKS[editWatermarkIdx], 24, bannerY + bannerH * 0.44);

          ctx.fillStyle = '#64748b';
          ctx.font = `${Math.max(12, Math.round(bannerH * 0.20))}px monospace`;
          const nowStr = new Date().toLocaleTimeString();
          ctx.fillText(`AURORA 16 · ${FILTERS[editFilterIdx].name} · ${nowStr}`, 24, bannerY + bannerH * 0.76);

          // Red Leica / Zeiss Badge dot
          const badgeR = Math.round(bannerH * 0.24);
          const badgeX = canvas.width - badgeR - 24;
          const badgeY = bannerY + bannerH * 0.5;
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(badgeR * 0.9)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('徠', badgeX, badgeY);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = selectedPhoto.url;
    });
  };

  const handleSaveOverwrite = async () => {
    if (!selectedPhoto) return;
    setIsProcessingSave(true);
    const editedUrl = await generateEditedImageDataUrl();
    setIsProcessingSave(false);

    if (editedUrl) {
      updatePhoto(selectedPhoto.id, {
        url: editedUrl,
        filter: FILTERS[editFilterIdx].name
      });
      setSelectedPhoto(prev => prev ? { ...prev, url: editedUrl, filter: FILTERS[editFilterIdx].name } : null);
      setIsEditing(false);
      showToast('照片修改已保存 (Modifiche Salvate)');
    } else {
      showToast('保存失败，请重试');
    }
  };

  const handleSaveAsCopy = async () => {
    if (!selectedPhoto) return;
    setIsProcessingSave(true);
    const editedUrl = await generateEditedImageDataUrl();
    setIsProcessingSave(false);

    if (editedUrl) {
      addPhoto({
        url: editedUrl,
        title: `${selectedPhoto.title} · ${FILTERS[editFilterIdx].name}`,
        location: selectedPhoto.location,
        filter: FILTERS[editFilterIdx].name,
        isUserPhoto: true
      });
      setIsEditing(false);
      showToast('已保存为新照片 (Copia Salvata)');
    } else {
      showToast('生成新照片失败');
    }
  };

  const handleDownload = async () => {
    if (!selectedPhoto) return;
    const urlToDownload = isEditing ? await generateEditedImageDataUrl() : selectedPhoto.url;
    if (!urlToDownload) return;

    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = `${selectedPhoto.title || 'photo'}_edited.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('照片已下载到设备 (Foto Scaricata)');
  };

  const takeSnapshot = () => {
    sound.playShutter();
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (hasCameraPermission && videoRef.current && videoRef.current.videoWidth > 0) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.filter = FILTERS[cameraFilterIdx].css;
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      if (facingMode === 'user') {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.5, '#e0f2fe');
      grad.addColorStop(1, '#fce7f3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(360, 400, 160, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.beginPath();
      ctx.arc(440, 520, 140, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Watermark at bottom (if enabled)
    if (cameraWatermarkEnabled) {
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(CAMERA_WATERMARKS[cameraWatermarkIdx], 32, canvas.height - 48);

      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      const nowStr = new Date().toLocaleTimeString();
      ctx.fillText(`SHOT ON AURORA 16 · ${nowStr}`, 32, canvas.height - 24);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    addPhoto({
      url: dataUrl,
      title: `极光快照 · ${FILTERS[cameraFilterIdx].name}`,
      location: '极光镜头 · 拍摄',
      filter: FILTERS[cameraFilterIdx].name,
      isUserPhoto: true
    });

    setMode('gallery');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      addPhoto({
        url: result,
        title: file.name.replace(/\.[^/.]+$/, ''),
        location: '本地导入',
        filter: '原图',
        isUserPhoto: true
      });
      showToast('照片已成功导入相册');
    };
    reader.readAsDataURL(file);
  };

  const handleSetWallpaper = (photo: Photo) => {
    updateSettings({ wallpaper: photo.url });
    sound.playSuccess();
    showToast('已设为手机壁纸 (Impostato come Sfondo)');
  };

  // ==================== 1. FULL SCREEN PHOTO EDITOR ====================
  if (selectedPhoto && isEditing) {
    const liveFilterCss = getCombinedFilterCss(editFilterIdx);

    return (
      <div className="flex flex-col h-full bg-stone-950 text-white select-none">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-900 border-b border-stone-800 shrink-0 z-20">
          <button
            onClick={closeEditor}
            disabled={isProcessingSave}
            className="flex items-center gap-1 text-xs font-bold text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 transition-all"
          >
            <X size={15} />
            <span>{t('取消', 'Annulla')}</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Sliders size={14} className="text-amber-400" />
              <span>{t('照片编辑器', 'Modifica Foto')}</span>
            </span>
            <span className="text-[10px] text-stone-500 block truncate max-w-[150px]">
              {selectedPhoto.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveAsCopy}
              disabled={isProcessingSave}
              className="text-[11px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
              title="Salva come nuova foto"
            >
              {t('另存新片', 'Copia')}
            </button>
            <button
              onClick={handleSaveOverwrite}
              disabled={isProcessingSave}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg shadow-xs active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
              title="Sovrascrivi foto originale"
            >
              <Check size={14} />
              <span>{t('完成保存', 'Salva')}</span>
            </button>
          </div>
        </div>

        {/* Live Preview Canvas Viewport */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3 bg-stone-950">
          <div className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-stone-800">
            <img
              src={selectedPhoto.url}
              alt="Preview"
              style={{
                filter: liveFilterCss,
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                transition: 'filter 0.15s ease, transform 0.2s ease'
              }}
              className="max-h-[50vh] max-w-full object-contain pointer-events-none"
            />

            {/* Live Watermark Overlay (if enabled) */}
            {watermarkEnabled && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-3 py-2 text-stone-900 border-t border-stone-200 flex items-center justify-between shadow-lg">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-[11px] text-stone-900 truncate">
                    {CAMERA_WATERMARKS[editWatermarkIdx]}
                  </div>
                  <div className="text-[9px] text-stone-500 font-mono">
                    AURORA 16 · {FILTERS[editFilterIdx].name} · {FILTERS[editFilterIdx].nameIt}
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-red-600 text-white font-serif text-[10px] flex items-center justify-center font-bold shrink-0">
                  徠
                </div>
              </div>
            )}
          </div>

          {/* Quick Download Button in Editor */}
          <button
            onClick={handleDownload}
            title="Scarica immagine modificata"
            className="absolute top-4 right-4 p-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-700/80 shadow-md active:scale-95 transition-all"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Editor Controls & Toolbars */}
        <div className="bg-stone-900 border-t border-stone-800 shrink-0">
          {/* Sub-panel Content based on active tab */}
          <div className="p-3 min-h-[100px]">
            {/* 1. FILTERS TAB */}
            {editTab === 'filters' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-semibold">
                  <span>{t('滤镜预设 (Filtri Colore)', 'Seleziona Filtro')}</span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {FILTERS[editFilterIdx].name} ({FILTERS[editFilterIdx].nameIt})
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto slim-scrollbar py-1 touch-scroll">
                  {FILTERS.map((f, idx) => (
                    <button
                      key={f.name}
                      onClick={() => setEditFilterIdx(idx)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border shrink-0 transition-all cursor-pointer active:scale-95 ${
                        editFilterIdx === idx
                          ? 'bg-amber-400/15 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                          : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <div
                        className="w-11 h-11 rounded-lg overflow-hidden border border-stone-600/60 relative"
                        style={{ filter: f.css }}
                      >
                        <img
                          src={selectedPhoto.url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{f.name}</span>
                      <span className="text-[9px] text-stone-400 leading-tight">{f.nameIt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ADJUST TAB */}
            {editTab === 'adjust' && (
              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                  <span>{t('光影与色彩微调 (Regolazioni)', 'Regolazioni Manuali')}</span>
                  <button
                    onClick={resetAdjustments}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw size={12} />
                    <span>{t('重置', 'Reset')}</span>
                  </button>
                </div>

                {/* Brightness Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Sun size={14} className="text-amber-400" />
                      <span>{t('亮度 (Luminosità)', 'Luminosità')}</span>
                    </span>
                    <span className="font-mono text-stone-400 text-[11px]">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={brightness}
                    onChange={e => setBrightness(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Contrast size={14} className="text-sky-400" />
                      <span>{t('对比度 (Contrasto)', 'Contrasto')}</span>
                    </span>
                    <span className="font-mono text-stone-400 text-[11px]">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={contrast}
                    onChange={e => setContrast(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Sparkles size={14} className="text-pink-400" />
                      <span>{t('饱和度 (Saturazione)', 'Saturazione')}</span>
                    </span>
                    <span className="font-mono text-stone-400 text-[11px]">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={e => setSaturation(Number(e.target.value))}
                    className="w-full accent-pink-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. TRANSFORM TAB */}
            {editTab === 'transform' && (
              <div className="space-y-3">
                <div className="text-xs text-stone-400 px-1 font-semibold">
                  {t('旋转与对称变换 (Ruota & Rifletti)', 'Trasformazione')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCw size={17} className="text-amber-400" />
                    <span>{t('顺时针旋转 90°', 'Ruota 90°')}</span>
                    <span className="text-[10px] text-stone-400 font-mono">({rotation}°)</span>
                  </button>

                  <button
                    onClick={() => setFlipH(prev => !prev)}
                    className={`flex items-center justify-center gap-2 py-3 border rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer ${
                      flipH
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
                    }`}
                  >
                    <FlipHorizontal size={17} className="text-sky-400" />
                    <span>{t('水平镜像翻转', 'Rifletti Specchio')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. WATERMARK TAB */}
            {editTab === 'watermark' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-semibold">
                  <span>{t('大师镜头水印条 (Filigrana Leica / Zeiss)', 'Filigrana')}</span>
                  <button
                    onClick={() => setWatermarkEnabled(prev => !prev)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                      watermarkEnabled
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-stone-800 border-stone-700 text-stone-400'
                    }`}
                  >
                    {watermarkEnabled ? t('已启用水印', 'Attiva') : t('已关闭水印', 'Disattiva')}
                  </button>
                </div>

                <div className="space-y-1.5">
                  {CAMERA_WATERMARKS.map((wm, idx) => (
                    <button
                      key={wm}
                      onClick={() => {
                        setEditWatermarkIdx(idx);
                        setWatermarkEnabled(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        watermarkEnabled && editWatermarkIdx === idx
                          ? 'bg-amber-400/15 border-amber-400 text-amber-200 font-bold'
                          : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate">{wm}</span>
                      {watermarkEnabled && editWatermarkIdx === idx && (
                        <Check size={14} className="text-amber-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Tabs Switcher */}
          <div className="grid grid-cols-4 border-t border-stone-800 py-1 bg-stone-950">
            <button
              onClick={() => setEditTab('filters')}
              className={`flex flex-col items-center py-1.5 text-xs font-bold transition-colors ${
                editTab === 'filters' ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles size={16} />
              <span className="text-[10px] mt-0.5">{t('滤镜', 'Filtri')}</span>
            </button>

            <button
              onClick={() => setEditTab('adjust')}
              className={`flex flex-col items-center py-1.5 text-xs font-bold transition-colors ${
                editTab === 'adjust' ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders size={16} />
              <span className="text-[10px] mt-0.5">{t('光影', 'Regola')}</span>
            </button>

            <button
              onClick={() => setEditTab('transform')}
              className={`flex flex-col items-center py-1.5 text-xs font-bold transition-colors ${
                editTab === 'transform' ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <RotateCw size={16} />
              <span className="text-[10px] mt-0.5">{t('旋转', 'Ruota')}</span>
            </button>

            <button
              onClick={() => setEditTab('watermark')}
              className={`flex flex-col items-center py-1.5 text-xs font-bold transition-colors ${
                editTab === 'watermark' ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Type size={16} />
              <span className="text-[10px] mt-0.5">{t('水印', 'Filigrana')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. PHOTO DETAIL VIEW (WITH EDIT BUTTON) ====================
  if (selectedPhoto && !isEditing) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-white select-none">
        {/* Detail Top Bar */}
        <div className="flex items-center justify-between px-3.5 py-3 bg-slate-900/90 border-b border-slate-800 z-10 shrink-0">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="flex items-center gap-1 text-sm font-bold text-white hover:text-slate-200 active:scale-95 transition-all"
          >
            <ChevronLeft size={22} />
            <span>{t('返回相册', 'Galleria')}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* PROMINENT EDIT BUTTON */}
            <button
              onClick={() => openEditor(selectedPhoto)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-xs transition-all active:scale-95"
              title="Modifica questa foto (Filtri, Regolazioni, Filigrana, Rotazione)"
            >
              <Sliders size={15} />
              <span>{t('编辑修图', 'Modifica')}</span>
            </button>

            <button
              onClick={() => handleSetWallpaper(selectedPhoto)}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-xs active:scale-95"
            >
              {t('设为壁纸', 'Sfondo')}
            </button>

            <button
              onClick={handleDownload}
              title="Scarica foto sul dispositivo"
              className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
            >
              <Download size={17} />
            </button>

            <button
              onClick={() => {
                deletePhoto(selectedPhoto.id);
                setSelectedPhoto(null);
              }}
              title="Elimina foto"
              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors active:scale-95"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {/* Photo Viewport */}
        <div className="flex-1 flex items-center justify-center p-3 overflow-hidden bg-black/50">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.title}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </div>

        {/* Photo Metadata Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-base">{selectedPhoto.title}</span>
            {selectedPhoto.filter && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                {selectedPhoto.filter}
              </span>
            )}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{selectedPhoto.location}</span>
            <span className="font-mono">{selectedPhoto.date}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. CAMERA MODE ====================
  if (mode === 'camera') {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-white relative select-none">
        {/* Camera Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md z-10 shrink-0">
          <button
            onClick={() => setMode('gallery')}
            className="text-xs font-bold text-white px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            {t('返回相册', 'Galleria')}
          </button>

          <div className="flex items-center gap-2">
            {/* Toggle Watermark on/off cleanly without covering the screen */}
            <button
              onClick={() => setCameraWatermarkEnabled(prev => !prev)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                cameraWatermarkEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-white/10 text-white/60 border-white/20'
              }`}
              title="Attiva o disattiva la filigrana Leica sulla foto"
            >
              {cameraWatermarkEnabled ? 'Filigrana: ON' : 'Filigrana: OFF'}
            </button>

            <button
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl active:scale-95 transition-all cursor-pointer"
              title="Inverti fotocamera frontale/posteriore"
            >
              <SwitchCamera size={16} />
            </button>
          </div>
        </div>

        {/* Viewfinder: 100% CLEAN, UNOBSTRUCTED LIVE VIDEO */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
          {/* Real Camera Video Element: ALWAYS MOUNTED in the DOM so ref is never null */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ filter: FILTERS[cameraFilterIdx].css }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              hasCameraPermission || mediaStream ? 'opacity-100' : 'opacity-0 absolute inset-0'
            } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            onLoadedMetadata={e => {
              const vid = e.target as HTMLVideoElement;
              vid.play().then(() => setIsCameraActive(true)).catch(() => {});
            }}
          />

          {/* Simple Permission Grant prompt ONLY if no stream and no permission */}
          {!hasCameraPermission && !mediaStream && (
            <div
              style={{ filter: FILTERS[cameraFilterIdx].css }}
              className="w-full h-full flex flex-col items-center justify-center bg-stone-950 p-6 text-center text-white"
            >
              <Camera size={44} className="text-amber-400 mb-3" />
              <h3 className="text-base font-bold mb-1">
                {t('启用相机拍摄', 'Attiva Fotocamera')}
              </h3>
              <p className="text-xs text-stone-300 max-w-xs font-medium mb-4">
                {t('请允许浏览器使用摄像头，或点击下方切换镜头', 'Consenti l\'accesso alla fotocamera per visualizzare l\'anteprima in tempo reale')}
              </p>
              <button
                onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <SwitchCamera size={16} />
                <span>{t('切换 / 连接镜头', 'Connetti Fotocamera')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters Picker */}
        <div className="px-4 py-2 bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 touch-scroll">
          {FILTERS.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setCameraFilterIdx(idx)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors active:scale-95 ${
                cameraFilterIdx === idx
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {f.name} ({f.nameIt})
            </button>
          ))}
        </div>

        {/* Shutter Controls */}
        <div className="p-4 bg-black flex items-center justify-around shrink-0">
          <button
            onClick={() => setMode('gallery')}
            className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer"
            title="Galleria"
          >
            <ImageIcon size={20} />
          </button>

          {/* Big Shutter button */}
          <button
            onClick={takeSnapshot}
            className="w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-white active:bg-amber-400 transition-colors" />
          </button>

          {/* Switch Camera Button (Front / Rear) */}
          <button
            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
            title="Inverti Fotocamera Frontale / Posteriore"
            className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <SwitchCamera size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ==================== 4. MAIN GALLERY GRID ====================
  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-none">
      {/* Gallery Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{t('图库与相册', 'Galleria Foto')}</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {photos.length} 张
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('摄影作品与壁纸精选 · 支持修图滤镜', 'Tocca una foto per visualizzare o modificare')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            title="上传本地图片"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors active:scale-95"
          >
            <Upload size={17} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setMode('camera')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Camera size={17} />
            <span>{t('拍照', 'Scatta')}</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-3 slim-scrollbar touch-scroll">
        <div className="grid grid-cols-3 gap-2">
          {photos.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPhoto(p)}
              className="group relative aspect-square bg-slate-200 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-2xs border border-slate-200"
            >
              <img
                src={p.url}
                alt={p.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                <span className="text-xs font-bold text-white truncate">{p.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
