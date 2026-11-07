import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  SwitchCamera,
  SlidersHorizontal,
  Grid3X3,
  Timer,
  Zap,
  ZapOff
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
  const { photos, addPhoto, updatePhoto, deletePhoto, updateSettings, t, showToast, activeAppId } = usePhone();

  // Mode: initialized to camera if opened via Camera app icon, else gallery
  const [mode, setMode] = useState<'gallery' | 'camera'>(() => activeAppId === 'camera' ? 'camera' : 'gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Sync mode if activeAppId changes
  useEffect(() => {
    if (activeAppId === 'camera') {
      setMode('camera');
    }
  }, [activeAppId]);

  // Live Camera State & Hardware Control
  const [cameraFilterIdx, setCameraFilterIdx] = useState(0);
  const [cameraWatermarkIdx, setCameraWatermarkIdx] = useState(0);
  const [cameraWatermarkEnabled, setCameraWatermarkEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraDirection, setCameraDirection] = useState<'user' | 'environment'>('environment');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const activeDeviceIndexRef = useRef<number>(0);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number>(0);
  const [currentDeviceLabel, setCurrentDeviceLabel] = useState<string>('');
  const [manualMirror, setManualMirror] = useState<boolean | null>(null);

  // Dedicated Camera Menu & Shot Options
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);
  const [cameraTimer, setCameraTimer] = useState<number>(0); // 0 = off, 3, 5, 10
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [flashSimulation, setFlashSimulation] = useState<'off' | 'on' | 'auto'>('auto');
  const [isFlashing, setIsFlashing] = useState(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

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

  // Release camera hardware tracks completely to unlock sensors
  const stopCurrentStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Track stop error:', e);
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    setMediaStream(null);
    setIsCameraActive(false);
  }, []);

  // Helper to categorize device label as rear or front
  const isDeviceRear = (device: MediaDeviceInfo): boolean => {
    const lbl = (device.label || '').toLowerCase();
    // 1. Explicit rear/back keywords in various languages
    if (
      lbl.includes('back') ||
      lbl.includes('rear') ||
      lbl.includes('environment') ||
      lbl.includes('posteriore') ||
      lbl.includes('retro') ||
      lbl.includes('derriere') ||
      lbl.includes('derrière') ||
      lbl.includes('trasera') ||
      lbl.includes('traseira') ||
      lbl.includes('rück') ||
      lbl.includes('hinter') ||
      lbl.includes('wide') ||
      lbl.includes('ultra wide') ||
      lbl.includes('telephoto') ||
      lbl.includes('macro') ||
      lbl.includes('后')
    ) {
      if (
        !lbl.includes('front') &&
        !lbl.includes('anteriore') &&
        !lbl.includes('user') &&
        !lbl.includes('selfie') &&
        !lbl.includes('face') &&
        !lbl.includes('avant') &&
        !lbl.includes('前')
      ) {
        return true;
      }
    }

    // 2. Android Camera2 numbering:
    // In Android Camera2 API, Camera ID 0 is the primary BACK camera!
    // Camera ID 1 is FRONT. Camera ID 2/3 are auxiliary back cameras (ultra-wide/telephoto).
    if (
      (lbl.includes('camera2 0') ||
        lbl.includes('camera 0') ||
        lbl.includes('camera2 2') ||
        lbl.includes('camera2 3') ||
        lbl.includes('camera 2')) &&
      !lbl.includes('front') &&
      !lbl.includes('anteriore') &&
      !lbl.includes('user') &&
      !lbl.includes('selfie')
    ) {
      return true;
    }

    return false;
  };

  const isDeviceFront = (device: MediaDeviceInfo): boolean => {
    const lbl = (device.label || '').toLowerCase();
    if (
      lbl.includes('front') ||
      lbl.includes('user') ||
      lbl.includes('face') ||
      lbl.includes('selfie') ||
      lbl.includes('anteriore') ||
      lbl.includes('avant') ||
      lbl.includes('vorder') ||
      lbl.includes('delantera') ||
      lbl.includes('facetime') ||
      lbl.includes('前')
    ) {
      return true;
    }
    // Android Camera ID 1 is the front camera
    if (
      (lbl.includes('camera2 1') || lbl.includes('camera 1')) &&
      !lbl.includes('back') &&
      !lbl.includes('rear') &&
      !lbl.includes('retro') &&
      !lbl.includes('posteriore')
    ) {
      return true;
    }
    return false;
  };

  // Helper to reliably find the rear camera device
  const findRearDevice = (devices: MediaDeviceInfo[]): { device: MediaDeviceInfo; index: number } | null => {
    if (!devices || devices.length === 0) return null;
    // 1. Explicit rear/back label
    const rearIdx = devices.findIndex(d => isDeviceRear(d));
    if (rearIdx !== -1) return { device: devices[rearIdx], index: rearIdx };

    // 2. Device that is explicitly NOT front
    const notFrontIdx = devices.findIndex(d => !isDeviceFront(d));
    if (notFrontIdx !== -1 && devices.length > 1) return { device: devices[notFrontIdx], index: notFrontIdx };

    // 3. Android convention: on multi-camera devices, index 0 is primary rear
    if (devices.length > 1) return { device: devices[0], index: 0 };
    return { device: devices[0], index: 0 };
  };

  // Helper to reliably find the front camera device
  const findFrontDevice = (devices: MediaDeviceInfo[]): { device: MediaDeviceInfo; index: number } | null => {
    if (!devices || devices.length === 0) return null;
    // 1. Explicit front label
    const frontIdx = devices.findIndex(d => isDeviceFront(d));
    if (frontIdx !== -1) return { device: devices[frontIdx], index: frontIdx };

    // 2. Device that is explicitly NOT rear
    const notRearIdx = devices.findIndex(d => !isDeviceRear(d));
    if (notRearIdx !== -1 && devices.length > 1) return { device: devices[notRearIdx], index: notRearIdx };

    // 3. Android convention: on multi-camera devices, index 1 is selfie camera
    if (devices.length > 1) return { device: devices[1], index: 1 };
    return { device: devices[0], index: 0 };
  };

  // Robust stream starter with fallback constraints chain
  const activateCamera = useCallback(async (
    targetMode: 'user' | 'environment',
    targetDeviceId?: string | null,
    targetIndex?: number
  ) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setCameraError('Il browser in uso non supporta l\'accesso alla fotocamera (getUserMedia non disponibile).');
      return;
    }

    setIsSwitchingCamera(true);
    setCameraError(null);
    setCameraDirection(targetMode);
    stopCurrentStream();

    // 250ms pause to ensure mobile hardware camera lock is fully relinquished by the OS
    await new Promise(r => setTimeout(r, 250));

    let stream: MediaStream | null = null;

    // Helper to safely try getUserMedia with specific constraint
    const tryConstraints = async (videoConstraint: any): Promise<MediaStream | null> => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: videoConstraint,
          audio: false
        });
      } catch (err) {
        console.warn('Constraint attempt failed:', videoConstraint, err);
        return null;
      }
    };

    if (targetMode === 'environment') {
      // 1. If targetDeviceId provided, try that specific hardware device
      if (targetDeviceId) {
        stream = await tryConstraints({ deviceId: { exact: targetDeviceId } });
        if (!stream) {
          stream = await tryConstraints({ deviceId: targetDeviceId });
        }
      }

      // 2. STRICT exact rear constraint (W3C standard: forbids front camera fallback!)
      if (!stream) {
        stream = await tryConstraints({ facingMode: { exact: 'environment' } });
      }

      // 3. If exact failed, search hardware devices for rear sensor
      if (!stream) {
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const vDevs = all.filter(d => d.kind === 'videoinput');
          const rearMatch = findRearDevice(vDevs);
          if (rearMatch && rearMatch.device.deviceId) {
            stream = await tryConstraints({ deviceId: { exact: rearMatch.device.deviceId } });
            if (!stream) {
              stream = await tryConstraints({ deviceId: rearMatch.device.deviceId });
            }
          }
        } catch (e) {}
      }

      // 4. Standard environment facingMode
      if (!stream) {
        stream = await tryConstraints({ facingMode: 'environment' });
      }

      // 5. Permissive fallback (for single webcam devices)
      if (!stream) {
        stream = await tryConstraints({ facingMode: { ideal: 'environment' } });
      }
    } else {
      // targetMode === 'user'
      // 1. If targetDeviceId provided, try exact deviceId
      if (targetDeviceId) {
        stream = await tryConstraints({ deviceId: { exact: targetDeviceId } });
        if (!stream) {
          stream = await tryConstraints({ deviceId: targetDeviceId });
        }
      }

      // 2. STRICT exact user constraint
      if (!stream) {
        stream = await tryConstraints({ facingMode: { exact: 'user' } });
      }

      // 3. Find front sensor deviceId
      if (!stream) {
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const vDevs = all.filter(d => d.kind === 'videoinput');
          const frontMatch = findFrontDevice(vDevs);
          if (frontMatch && frontMatch.device.deviceId) {
            stream = await tryConstraints({ deviceId: { exact: frontMatch.device.deviceId } });
            if (!stream) {
              stream = await tryConstraints({ deviceId: frontMatch.device.deviceId });
            }
          }
        } catch (e) {}
      }

      // 4. Standard user facingMode
      if (!stream) {
        stream = await tryConstraints({ facingMode: 'user' });
      }

      // 5. Permissive fallback
      if (!stream) {
        stream = await tryConstraints({ facingMode: { ideal: 'user' } });
      }
    }

    // 6. Final fallback to any available video input
    if (!stream) {
      stream = await tryConstraints(true);
    }

    // 7. Handle failure gracefully with clear guidance
    if (!stream) {
      console.error('All camera attempts failed');
      setHasCameraPermission(false);
      setIsSwitchingCamera(false);
      setCameraError(
        'Impossibile accedere alla fotocamera. Verifica che i permessi siano concessi nel browser, oppure tocca "Scatta con Fotocamera Nativa" per aprire la fotocamera del tuo telefono.'
      );
      return;
    }

    mediaStreamRef.current = stream;
    setMediaStream(stream);
    setHasCameraPermission(true);
    setCameraError(null);
    setIsSwitchingCamera(false);

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        setIsCameraActive(true);
      }).catch(err => console.warn('Video play error:', err));
    }

    // Refresh devices list with unlocked permissions
    let freshDevices: MediaDeviceInfo[] = [];
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      freshDevices = all.filter(d => d.kind === 'videoinput');
      setVideoDevices(freshDevices);
    } catch (e) {
      console.warn('enumerate error', e);
    }

    // Check active track settings to determine active index and label
    const activeTrack = stream.getVideoTracks()[0];
    const trackLabel = activeTrack?.label || '';
    setCurrentDeviceLabel(trackLabel);

    let activeIdx = targetIndex ?? activeDeviceIndexRef.current;
    if (freshDevices.length > 0) {
      const foundIdx = freshDevices.findIndex(d => {
        if (targetDeviceId && d.deviceId === targetDeviceId) return true;
        if (trackLabel && d.label === trackLabel) return true;
        return false;
      });
      if (foundIdx !== -1) {
        activeIdx = foundIdx;
      }
    }
    activeDeviceIndexRef.current = activeIdx;
    setActiveDeviceIndex(activeIdx);
    setCurrentDeviceId(freshDevices[activeIdx]?.deviceId || targetDeviceId || null);
  }, [stopCurrentStream]);

  // Ensure video element properties for mobile autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
    }
  }, []);

  // Keep videoRef.srcObject synchronized whenever mediaStream state changes
  useEffect(() => {
    const vid = videoRef.current;
    if (vid && mediaStream) {
      vid.muted = true;
      vid.defaultMuted = true;
      if (vid.srcObject !== mediaStream) {
        vid.srcObject = mediaStream;
      }
      vid.play().then(() => setIsCameraActive(true)).catch(() => {});
    }
  }, [mediaStream]);

  // Main lifecycle for camera mode
  useEffect(() => {
    if (mode === 'camera') {
      activateCamera('environment', null, 0);
    } else {
      stopCurrentStream();
    }

    return () => {
      stopCurrentStream();
    };
  }, [mode]);

  // Switch to specific camera by index
  const selectCameraByIndex = useCallback(async (index: number) => {
    sound.playTap();
    if (index < 0 || index >= videoDevices.length) return;
    const targetDev = videoDevices[index];
    const isRear = isDeviceRear(targetDev);
    const targetMode: 'user' | 'environment' = isRear ? 'environment' : 'user';

    await activateCamera(targetMode, targetDev.deviceId, index);

    showToast(
      isRear
        ? `📷 Fotocamera Posteriore (#${index + 1})`
        : `🤳 Fotocamera Frontale (#${index + 1})`
    );
  }, [videoDevices, activateCamera, showToast]);

  // Switch to Rear Camera
  const switchToRearCamera = useCallback(async () => {
    sound.playTap();
    let devs = videoDevices;
    if (devs.length === 0 && navigator.mediaDevices?.enumerateDevices) {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        devs = all.filter(d => d.kind === 'videoinput');
        setVideoDevices(devs);
      } catch (e) {}
    }

    const rear = findRearDevice(devs);
    if (rear && rear.device) {
      await activateCamera('environment', rear.device.deviceId, rear.index);
    } else {
      await activateCamera('environment', null);
    }

    if (devs.length === 1) {
      showToast('📷 Fotocamera Unica (Webcam - Modalità naturale non specchiata)');
    } else {
      showToast('📷 Fotocamera Posteriore (Retro)');
    }
  }, [videoDevices, activateCamera, showToast]);

  // Switch to Front Camera
  const switchToFrontCamera = useCallback(async () => {
    sound.playTap();
    let devs = videoDevices;
    if (devs.length === 0 && navigator.mediaDevices?.enumerateDevices) {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        devs = all.filter(d => d.kind === 'videoinput');
        setVideoDevices(devs);
      } catch (e) {}
    }

    const front = findFrontDevice(devs);
    if (front && front.device) {
      await activateCamera('user', front.device.deviceId, front.index);
    } else {
      await activateCamera('user', null);
    }

    showToast('🤳 Fotocamera Frontale (Selfie)');
  }, [videoDevices, activateCamera, showToast]);

  // Toggle button (cycles between rear and front)
  const handleToggleCamera = useCallback(async () => {
    sound.playTap();
    if (cameraDirection === 'user') {
      await switchToRearCamera();
    } else {
      await switchToFrontCamera();
    }
  }, [cameraDirection, switchToRearCamera, switchToFrontCamera]);

  // Handle photo captured via native phone camera
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playShutter();
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 720;
        canvas.height = img.naturalHeight || img.height || 960;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.filter = FILTERS[cameraFilterIdx].css;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw Watermark at bottom (if enabled)
        if (cameraWatermarkEnabled) {
          ctx.filter = 'none';
          const bannerH = Math.max(70, Math.round(canvas.height * 0.085));
          const bannerY = canvas.height - bannerH;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(0, bannerY, canvas.width, bannerH);

          ctx.fillStyle = '#0f172a';
          ctx.font = `bold ${Math.max(16, Math.round(bannerH * 0.28))}px system-ui, sans-serif`;
          ctx.fillText(CAMERA_WATERMARKS[cameraWatermarkIdx], 32, bannerY + bannerH * 0.44);

          ctx.fillStyle = '#64748b';
          ctx.font = `${Math.max(12, Math.round(bannerH * 0.20))}px monospace`;
          const nowStr = new Date().toLocaleTimeString();
          ctx.fillText(`AURORA 16 · FOTOCAMERA POSTERIORE · ${nowStr}`, 32, bannerY + bannerH * 0.76);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        addPhoto({
          url: dataUrl,
          title: `极光快照 · ${FILTERS[cameraFilterIdx].name}`,
          location: '极光镜头 · 拍摄',
          filter: FILTERS[cameraFilterIdx].name,
          isUserPhoto: true
        });

        showToast('Foto scattata e salvata nella Galleria!');
        setMode('gallery');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Derived state to check if selfie mirror mode should be applied
  const isFacingUser = cameraDirection === 'user';
  const effectiveIsMirrored = manualMirror !== null ? manualMirror : isFacingUser;

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
      if (effectiveIsMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      if (effectiveIsMirrored) {
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

  const cancelCountdown = () => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownRemaining(null);
  };

  const triggerCameraCapture = () => {
    if (countdownRemaining !== null) {
      cancelCountdown();
      return;
    }

    if (cameraTimer > 0) {
      setIsCameraMenuOpen(false);
      let count = cameraTimer;
      setCountdownRemaining(count);
      sound.playTap();

      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
      }

      countdownTimerRef.current = window.setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownRemaining(count);
          sound.playTap();
        } else {
          if (countdownTimerRef.current !== null) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdownRemaining(null);
          executeFinalCapture();
        }
      }, 1000);
    } else {
      executeFinalCapture();
    }
  };

  const executeFinalCapture = () => {
    if (flashSimulation !== 'off') {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);
    }
    takeSnapshot();
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
      <div className="flex flex-col h-full bg-slate-950 text-white relative select-none overflow-hidden">
        {/* Camera Top Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-black/75 backdrop-blur-md z-30 shrink-0 border-b border-white/10">
          <button
            onClick={() => setMode('gallery')}
            className="flex items-center gap-1 text-xs font-bold text-white px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>{t('相册', 'Galleria')}</span>
          </button>

          {/* Center: Quick camera flip pill */}
          <button
            onClick={handleToggleCamera}
            disabled={isSwitchingCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer border border-white/20"
            title="Tocca per invertire fotocamera"
          >
            <SwitchCamera size={14} className={isSwitchingCamera ? 'animate-spin text-amber-400' : ''} />
            <span>{cameraDirection === 'environment' ? '📷 Retro' : '🤳 Frontale'}</span>
            {videoDevices.length > 1 && (
              <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full text-white/90 font-mono">
                {activeDeviceIndex + 1}/{videoDevices.length}
              </span>
            )}
          </button>

          {/* Right: Quick actions & Camera Menu Trigger */}
          <div className="flex items-center gap-1.5">
            {/* Quick Grid Button */}
            <button
              onClick={() => {
                sound.playTap();
                setShowGrid(g => !g);
              }}
              title="Griglia 3x3"
              className={`p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                showGrid
                  ? 'bg-amber-400/25 text-amber-300 border-amber-400/50'
                  : 'bg-white/10 text-white/70 border-white/15'
              }`}
            >
              <Grid3X3 size={15} />
            </button>

            {/* Quick Timer Indicator / Button */}
            <button
              onClick={() => {
                sound.playTap();
                setCameraTimer(t => (t === 0 ? 3 : t === 3 ? 5 : t === 5 ? 10 : 0));
              }}
              title="Timer autoscatto"
              className={`px-2 py-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                cameraTimer > 0
                  ? 'bg-amber-400/25 text-amber-300 border-amber-400/50'
                  : 'bg-white/10 text-white/70 border-white/15'
              }`}
            >
              <Timer size={14} />
              <span>{cameraTimer > 0 ? `${cameraTimer}s` : 'Off'}</span>
            </button>

            {/* Sleek Menù Fotocamera Button */}
            <button
              onClick={() => {
                sound.playTap();
                setIsCameraMenuOpen(prev => !prev);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                isCameraMenuOpen
                  ? 'bg-white text-stone-950 ring-1 ring-amber-400'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
              }`}
              title="Apri menù impostazioni fotocamera"
            >
              <SlidersHorizontal size={12} />
              <span>Menù</span>
            </button>
          </div>
        </div>

        {/* Hidden native camera capture input for guaranteed mobile rear capture */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture={cameraDirection === 'user' ? 'user' : 'environment'}
          className="hidden"
          onChange={handleNativeCapture}
        />

        {/* Viewfinder: 100% CLEAN, FULL-SCREEN LIVE VIDEO */}
        <div className="flex-1 min-h-0 relative w-full overflow-hidden bg-black flex items-center justify-center">
          {/* Real Camera Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ filter: FILTERS[cameraFilterIdx].css }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              hasCameraPermission || mediaStream ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${effectiveIsMirrored ? 'scale-x-[-1]' : 'scale-x-1'}`}
            onLoadedMetadata={e => {
              const vid = e.target as HTMLVideoElement;
              vid.muted = true;
              vid.play().then(() => setIsCameraActive(true)).catch(() => {});
            }}
          />

          {/* Screen Flash Animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Rule of Thirds 3x3 Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-white/25" />
              <div className="border-r border-white/25" />
              <div />
            </div>
          )}

          {/* Countdown Timer Overlay with clear visual feedback */}
          {countdownRemaining !== null && (
            <div className="absolute inset-0 z-40 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto select-none">
              <div className="w-20 h-20 rounded-full bg-amber-400/20 border-4 border-amber-400 flex items-center justify-center shadow-2xl mb-2 animate-pulse">
                <span className="text-4xl font-mono font-black text-amber-400 drop-shadow-md">
                  {countdownRemaining}
                </span>
              </div>
              <span className="text-xs font-bold text-white bg-black/70 px-3 py-1 rounded-full border border-white/20 mb-2">
                ⏱️ Autoscatto {countdownRemaining}s...
              </span>
              <button
                onClick={cancelCountdown}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-[10px] font-bold shadow-md cursor-pointer active:scale-95"
              >
                Annulla
              </button>
            </div>
          )}

          {/* Active Watermark Preview Badge at bottom of viewfinder */}
          {cameraWatermarkEnabled && (
            <div className="absolute bottom-2 left-3 right-3 z-15 pointer-events-none flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-[9px] text-amber-300 font-mono font-semibold truncate max-w-full shadow-md">
                📸 {CAMERA_WATERMARKS[cameraWatermarkIdx]}
              </div>
            </div>
          )}

          {/* Slide-down Menù Fotocamera Panel - Proporzionato e compatto */}
          {isCameraMenuOpen && (
            <div className="absolute inset-x-0 top-0 z-50 bg-stone-950/95 backdrop-blur-xl border-b border-amber-500/30 p-2.5 sm:p-3 shadow-2xl max-h-[85%] overflow-y-auto slim-scrollbar animate-in slide-in-from-top-2 duration-150">
              <div className="max-w-sm mx-auto space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                      <SlidersHorizontal size={12} />
                    </div>
                    <span className="text-xs font-bold text-white">Menù Fotocamera</span>
                  </div>
                  <button
                    onClick={() => setIsCameraMenuOpen(false)}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* 1. Watermark section */}
                <div className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1">
                      <span>🏷️ Filigrana Ottica</span>
                    </span>
                    <button
                      onClick={() => setCameraWatermarkEnabled(!cameraWatermarkEnabled)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        cameraWatermarkEnabled
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-white/15 text-stone-400'
                      }`}
                    >
                      {cameraWatermarkEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {cameraWatermarkEnabled && (
                    <div className="grid grid-cols-2 gap-1 pt-0.5">
                      {CAMERA_WATERMARKS.map((wm, idx) => (
                        <button
                          key={wm}
                          onClick={() => setCameraWatermarkIdx(idx)}
                          className={`p-1.5 rounded-lg border text-[10px] font-mono text-left truncate transition-all cursor-pointer ${
                            cameraWatermarkIdx === idx
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-bold'
                              : 'bg-black/30 text-stone-400 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          {cameraWatermarkIdx === idx ? '✓ ' : ''}{wm}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Timer & Mirror controls */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Autoscatto Timer */}
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="font-bold text-white text-[11px] block">⏱️ Autoscatto</span>
                    <div className="grid grid-cols-4 gap-0.5">
                      {[0, 3, 5, 10].map(s => (
                        <button
                          key={s}
                          onClick={() => setCameraTimer(s)}
                          className={`py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                            cameraTimer === s
                              ? 'bg-amber-400 text-stone-950'
                              : 'bg-white/10 text-stone-300 hover:bg-white/15'
                          }`}
                        >
                          {s === 0 ? 'Off' : `${s}s`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Effetto Specchio */}
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="font-bold text-white text-[11px] block">🪞 Specchio</span>
                    <button
                      onClick={() => setManualMirror(prev => (prev === null ? !effectiveIsMirrored : !prev))}
                      className={`w-full py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        effectiveIsMirrored
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-white/10 text-stone-300 hover:bg-white/15'
                      }`}
                    >
                      {effectiveIsMirrored ? 'Specchio ON' : 'Normale OFF'}
                    </button>
                  </div>
                </div>

                {/* 3. Grid & Flash simulation */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">📐 Griglia 3x3</span>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] cursor-pointer ${
                        showGrid ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {showGrid ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="font-bold text-white text-[11px] block">⚡ Flash Display</span>
                    <div className="grid grid-cols-3 gap-0.5">
                      {(['off', 'auto', 'on'] as const).map(fl => (
                        <button
                          key={fl}
                          onClick={() => setFlashSimulation(fl)}
                          className={`py-0.5 rounded-md text-[9px] font-bold uppercase cursor-pointer ${
                            flashSimulation === fl
                              ? 'bg-amber-400 text-stone-950'
                              : 'bg-white/10 text-stone-300'
                          }`}
                        >
                          {fl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Sensor Selection */}
                {videoDevices.length > 1 && (
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="font-bold text-white text-[11px] block">📷 Sensori Fotocamera:</span>
                    <div className="grid grid-cols-2 gap-1">
                      {videoDevices.map((dev, idx) => {
                        const isCur = activeDeviceIndex === idx;
                        const isRearDev = isDeviceRear(dev);
                        return (
                          <button
                            key={dev.deviceId || idx}
                            onClick={() => {
                              selectCameraByIndex(idx);
                              setIsCameraMenuOpen(false);
                            }}
                            className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition-all cursor-pointer ${
                              isCur
                                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                                : 'bg-white/10 text-stone-300 hover:bg-white/20'
                            }`}
                          >
                            <div className="truncate font-semibold">
                              {isRearDev ? `Retro #${idx + 1}` : `Frontale #${idx + 1}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Trigger physical mobile camera */}
                <button
                  onClick={() => {
                    nativeCameraInputRef.current?.click();
                    setIsCameraMenuOpen(false);
                  }}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs active:scale-98 transition-all"
                >
                  <Camera size={13} />
                  <span>Usa Fotocamera Nativa Smartphone</span>
                </button>
              </div>
            </div>
          )}

          {/* Simple Permission Grant / Error prompt ONLY if no stream and no permission */}
          {(!hasCameraPermission || !mediaStream) && (
            <div
              style={{ filter: FILTERS[cameraFilterIdx].css }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-stone-950 p-6 text-center text-white z-20"
            >
              <Camera size={44} className="text-amber-400 mb-3" />
              <h3 className="text-base font-bold mb-1">
                {t('启用相机拍摄', 'Attiva Fotocamera')}
              </h3>
              <p className="text-xs text-stone-300 max-w-xs font-medium mb-4 leading-relaxed">
                {cameraError || t('请允许浏览器使用摄像头，或点击下方切换镜头', 'Consenti l\'accesso alla fotocamera per visualizzare l\'anteprima in tempo reale')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={switchToRearCamera}
                  disabled={isSwitchingCamera}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Camera size={16} />
                  <span>📷 Fotocamera Posteriore (Retro)</span>
                </button>
                <button
                  onClick={switchToFrontCamera}
                  disabled={isSwitchingCamera}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <span>🤳 Fotocamera Frontale (Selfie)</span>
                </button>
              </div>

              {/* Native Mobile Camera trigger button (always works on smartphones) */}
              <button
                onClick={() => nativeCameraInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Camera size={15} />
                <span>📸 Scatta con Fotocamera Nativa del Telefono</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters Picker */}
        <div className="px-4 py-2 bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 touch-scroll border-t border-white/5">
          {FILTERS.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => {
                sound.playTap();
                setCameraFilterIdx(idx);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors active:scale-95 cursor-pointer ${
                cameraFilterIdx === idx
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {f.name} ({f.nameIt})
            </button>
          ))}
        </div>

        {/* Shutter Controls */}
        <div className="p-4 bg-black flex items-center justify-around shrink-0 border-t border-white/10">
          <button
            onClick={() => {
              sound.playTap();
              setMode('gallery');
            }}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer border border-white/15"
            title="Torna alla Galleria"
          >
            <ImageIcon size={20} />
          </button>

          {/* Big Shutter button (Live camera preview capture with timer and flash) */}
          <button
            onClick={triggerCameraCapture}
            disabled={isSwitchingCamera || countdownRemaining !== null}
            className="w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center active:scale-95 transition-transform cursor-pointer disabled:opacity-50 shadow-lg"
            title="Scatta foto"
          >
            <div className={`w-full h-full rounded-full transition-colors ${
              countdownRemaining !== null ? 'bg-amber-400 animate-pulse' : 'bg-white active:bg-amber-400'
            }`} />
          </button>

          {/* Switch Camera Button (Front / Rear) */}
          <button
            onClick={handleToggleCamera}
            disabled={isSwitchingCamera}
            title={cameraDirection === 'environment' ? 'Passa a Fotocamera Frontale (Selfie)' : 'Passa a Fotocamera Posteriore (Retro)'}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/15 flex flex-col items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <SwitchCamera size={18} className={isSwitchingCamera ? 'animate-spin text-amber-400' : 'text-white'} />
            <span className="text-[8px] font-bold text-slate-300 mt-0.5 leading-none">
              {cameraDirection === 'environment' ? 'Selfie' : 'Retro'}
            </span>
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
