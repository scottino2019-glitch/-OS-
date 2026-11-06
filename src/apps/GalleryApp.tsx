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
  Upload
} from 'lucide-react';

const CAMERA_WATERMARKS = [
  'AURORA 16 · 徕卡联合研发 | 50mm f/1.4 OIS',
  '极光影像 · 蔡司 T* 镀膜 镜头',
  'HUAZHI OPTICS · 50MP PRO SENSOR'
];

const FILTERS = [
  { name: '原图', css: 'none' },
  { name: '赛博', css: 'contrast(125%) saturate(140%) hue-rotate(15deg)' },
  { name: '胶片', css: 'sepia(30%) contrast(110%) brightness(95%)' },
  { name: '黑白', css: 'grayscale(100%) contrast(130%)' },
  { name: '清新', css: 'brightness(110%) saturate(85%) contrast(90%)' }
];

export const GalleryApp: React.FC = () => {
  const { photos, addPhoto, deletePhoto, updateSettings, t, showToast } = usePhone();

  const [mode, setMode] = useState<'gallery' | 'camera'>('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [watermarkIdx, setWatermarkIdx] = useState(0);

  // Webcam stream reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setHasCameraPermission(true);
        })
        .catch(() => {
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const takeSnapshot = () => {
    sound.playShutter();
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (hasCameraPermission && videoRef.current) {
      ctx.filter = FILTERS[selectedFilterIdx].css;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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

    // Draw Watermark at bottom
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(CAMERA_WATERMARKS[watermarkIdx], 32, canvas.height - 48);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px monospace';
    const nowStr = new Date().toLocaleTimeString();
    ctx.fillText(`SHOT ON AURORA 16 · ${nowStr}`, 32, canvas.height - 24);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    addPhoto({
      url: dataUrl,
      title: `极光快照 · ${FILTERS[selectedFilterIdx].name}`,
      location: '极光镜头 · 拍摄',
      filter: FILTERS[selectedFilterIdx].name,
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
    showToast('已设为手机壁纸');
  };

  // Full Screen Photo Detail
  if (selectedPhoto) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 z-10">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="flex items-center gap-1 text-sm font-bold text-white hover:text-slate-200"
          >
            <ChevronLeft size={22} />
            <span>{t('返回相册', 'Galleria')}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetWallpaper(selectedPhoto)}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors shadow-xs"
            >
              {t('设为壁纸', 'Imposta sfondo')}
            </button>
            <button
              onClick={() => {
                deletePhoto(selectedPhoto.id);
                setSelectedPhoto(null);
              }}
              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 overflow-hidden bg-black/40">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.title}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="text-white font-bold text-base">{selectedPhoto.title}</div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{selectedPhoto.location}</span>
            <span>{selectedPhoto.date}</span>
          </div>
        </div>
      </div>
    );
  }

  // Camera Mode
  if (mode === 'camera') {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-white relative">
        {/* Camera Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-md z-10">
          <button
            onClick={() => setMode('gallery')}
            className="text-xs font-bold text-white px-3 py-1.5 bg-white/20 rounded-xl"
          >
            {t('返回相册', 'Galleria')}
          </button>

          <button
            onClick={() => setWatermarkIdx((watermarkIdx + 1) % CAMERA_WATERMARKS.length)}
            className="text-xs font-bold text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 truncate max-w-[200px]"
          >
            {CAMERA_WATERMARKS[watermarkIdx]}
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
          {hasCameraPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: FILTERS[selectedFilterIdx].css }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              style={{ filter: FILTERS[selectedFilterIdx].css }}
              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-100 p-6 text-center text-slate-900"
            >
              <Sparkles size={52} className="text-amber-500 mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {t('极光 AI 仿生镜头就绪', 'Sensore Fotografico')}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs font-medium">
                {t('点击下方快门，拍摄并生成具有专属水印的艺术大片', 'Tocca l\'otturatore per scattare una foto con filtri e filigrana Leica')}
              </p>
            </div>
          )}

          {/* Watermark preview overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 text-xs text-slate-800 flex justify-between items-center border border-white/60 shadow-lg">
            <span className="font-bold text-slate-900 tracking-wide truncate max-w-[200px]">
              {CAMERA_WATERMARKS[watermarkIdx]}
            </span>
            <span className="text-amber-600 font-mono text-xs font-bold">OIS ON</span>
          </div>
        </div>

        {/* Filters Picker */}
        <div className="px-4 py-2 bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setSelectedFilterIdx(idx)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedFilterIdx === idx
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Shutter Controls */}
        <div className="p-4 bg-black flex items-center justify-around">
          <button
            onClick={() => setMode('gallery')}
            className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-200"
          >
            <ImageIcon size={20} />
          </button>

          {/* Big Shutter button */}
          <button
            onClick={takeSnapshot}
            className="w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-white active:bg-amber-400 transition-colors" />
          </button>

          <label className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 cursor-pointer">
            <Upload size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  // Gallery Mode
  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Gallery Header */}
      <div className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{t('图库与相册', 'Galleria Foto')}</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {photos.length} 张
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('摄影作品与壁纸精选', 'Foto & Sfondi')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            title="上传本地图片"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
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
      <div className="flex-1 overflow-y-auto p-3 slim-scrollbar">
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
