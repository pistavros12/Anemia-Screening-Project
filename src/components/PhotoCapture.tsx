import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle, Eye, Sliders } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface Props {
  onImageSelected: (imageDataUrl: string | null, croppedDataUrl: string | null) => void;
  lang: Language;
  theme: Theme;
}

export const PhotoCapture: React.FC<Props> = ({ onImageSelected, lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedRoi, setProcessedRoi] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount or mode switch
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError(t.camera_error_msg);
      setCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    processEyeRoi(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      processEyeRoi(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Clinical simulated preprocessing: detect_and_crop_eye() + gray_world_correct()
  const processEyeRoi = (imageDataUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cropW = Math.floor(img.width * 0.6);
      const cropH = Math.floor(img.height * 0.45);
      const cropX = Math.floor(img.width * 0.2);
      const cropY = Math.floor(img.height * 0.4);

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw cropped conjunctiva ROI
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Apply Gray-World color normalization approximation
      const imgData = ctx.getImageData(0, 0, cropW, cropH);
      const data = imgData.data;
      let totalR = 0,
        totalG = 0,
        totalB = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
      }

      const meanR = totalR / pixelCount;
      const meanG = totalG / pixelCount;
      const meanB = totalB / pixelCount;
      const gray = (meanR + meanG + meanB) / 3;

      const scaleR = gray / (meanR || 1);
      const scaleG = gray / (meanG || 1);
      const scaleB = gray / (meanB || 1);

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * scaleR);
        data[i + 1] = Math.min(255, data[i + 1] * scaleG);
        data[i + 2] = Math.min(255, data[i + 2] * scaleB);
      }

      ctx.putImageData(imgData, 0, 0);
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
      setProcessedRoi(croppedUrl);
      onImageSelected(imageDataUrl, croppedUrl);
    };
    img.src = imageDataUrl;
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setProcessedRoi(null);
    onImageSelected(null, null);
    if (inputMode === 'camera') {
      startCamera();
    }
  };

  // Preset sample conjunctiva generator for instant clinical testing
  const loadSampleConjunctiva = (isPaleAnemic: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background skin tone
    ctx.fillStyle = '#C68642';
    ctx.fillRect(0, 0, 640, 480);

    // Orbital rim shadow
    const grad = ctx.createRadialGradient(320, 240, 50, 320, 240, 280);
    grad.addColorStop(0, '#8D5524');
    grad.addColorStop(1, '#5C3818');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(320, 240, 260, 160, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sclera / eye globe
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.ellipse(320, 210, 200, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris & Pupil
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(320, 205, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(320, 205, 26, 0, Math.PI * 2);
    ctx.fill();

    // Palpebral conjunctiva lower mucosal fold
    const conjGrad = ctx.createLinearGradient(140, 260, 500, 340);
    if (isPaleAnemic) {
      // Pale mucosal pallor (severe anemia indicator)
      conjGrad.addColorStop(0, '#F1C7C1');
      conjGrad.addColorStop(0.5, '#F3D2CE');
      conjGrad.addColorStop(1, '#E6B8B2');
    } else {
      // Normal rich microvascular pink/red perfusion
      conjGrad.addColorStop(0, '#C23A3A');
      conjGrad.addColorStop(0.5, '#D94343');
      conjGrad.addColorStop(1, '#B02E2E');
    }
    ctx.fillStyle = conjGrad;
    ctx.beginPath();
    ctx.ellipse(320, 295, 180, 50, 0, 0, Math.PI);
    ctx.fill();

    // Microvascular capillary strands
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = isPaleAnemic ? '#E5989B' : '#8B0000';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(180 + i * 38, 295);
      ctx.quadraticCurveTo(190 + i * 38, 315, 200 + i * 38, 335);
      ctx.stroke();
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
    processEyeRoi(dataUrl);
  };

  return (
    <div
      id="photo-capture-section"
      className={`box-interactive-green rounded-2xl p-4 sm:p-6 shadow-sm transition-all ${
        isDark
          ? 'bg-[#1E293B] text-[#F8FAFC]'
          : 'bg-white text-slate-950'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Eye className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
          <h2 className={`font-serif-header text-base sm:text-lg font-extrabold ${
            isDark ? 'text-slate-100' : 'text-slate-950'
          }`}>
            {t.step_b_title}
          </h2>
        </div>

        {/* Input Mode Selector Toggle */}
        {!capturedImage && (
          <div
            className={`inline-flex p-1 rounded-xl border-2 self-start sm:self-auto ${
              isDark ? 'bg-[#0F172A] border-emerald-800/60' : 'bg-emerald-50 border-emerald-300'
            }`}
          >
            <button
              id="mode-toggle-upload"
              type="button"
              onClick={() => {
                stopCamera();
                setInputMode('upload');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? isDark
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-700 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-800 hover:text-emerald-950'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.file_upload_label}</span>
            </button>

            <button
              id="mode-toggle-camera"
              type="button"
              onClick={() => {
                setInputMode('camera');
                startCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                inputMode === 'camera'
                  ? isDark
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-700 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-800 hover:text-emerald-950'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.camera_input_label}</span>
            </button>
          </div>
        )}
      </div>

      <p className={`text-xs sm:text-sm mb-4 font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
        {t.photo_capture_hint}
      </p>

      {/* Active Capture / Preview Container */}
      {!capturedImage ? (
        inputMode === 'camera' ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video sm:aspect-[4/3] max-w-lg mx-auto rounded-xl overflow-hidden bg-black border-2 border-emerald-400 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Guide Overlay for Lower Eyelid positioning */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4/5 h-2/5 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center">
                  <span className="bg-black/85 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-md">
                    {t.camera_guide_hint}
                  </span>
                </div>
              </div>
            </div>

            {cameraError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-bold">{cameraError}</p>
            )}

            <div className="flex justify-center gap-3">
              <button
                id="btn-take-photo"
                onClick={handleCapturePhoto}
                disabled={!cameraActive}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isDark
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                } disabled:opacity-50`}
              >
                <Camera className="w-4 h-4" />
                <span>{t.take_photo}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label
              htmlFor="photo-file-input"
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDark
                  ? 'border-emerald-700/60 hover:border-emerald-400 bg-[#0F172A]/60'
                  : 'border-emerald-300 hover:border-emerald-600 bg-emerald-50/50'
              }`}
            >
              <Upload className="w-8 h-8 opacity-80 mb-2 text-emerald-700 dark:text-emerald-400" />
              <span className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{t.file_upload_label}</span>
              <span className={`text-xs mt-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{t.upload_format_hint}</span>
              <input
                id="photo-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Clinician Quick Test Presets */}
            <div className="text-center pt-1">
              <span className={`text-xs block mb-2 font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.quick_preset_label}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleConjunctiva(true)}
                  className={`box-interactive-gold px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#0F172A] text-amber-300'
                      : 'bg-amber-50/70 text-amber-950 shadow-xs'
                  }`}
                >
                  {t.preset_a_btn}
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleConjunctiva(false)}
                  className={`box-interactive-green px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#0F172A] text-emerald-300'
                      : 'bg-emerald-50/70 text-emerald-950 shadow-xs'
                  }`}
                >
                  {t.preset_b_btn}
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Image Preview & Eye ROI Analysis */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`box-interactive-green p-3.5 rounded-xl ${
                isDark ? 'bg-[#0F172A]' : 'bg-slate-50'
              }`}
            >
              <span className={`text-xs font-extrabold block mb-2 ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
                {t.original_image_label}
              </span>
              <img
                src={capturedImage}
                alt="Original capture"
                className="w-full h-44 object-cover rounded-lg border-2 border-emerald-300 dark:border-emerald-700"
              />
            </div>

            <div
              className={`box-interactive-gold p-3.5 rounded-xl ${
                isDark ? 'bg-[#0F172A]' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
                  {t.processed_roi_label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <Sliders className="w-3 h-3" /> Gray-World
                </span>
              </div>
              {processedRoi ? (
                <img
                  src={processedRoi}
                  alt="Processed ROI"
                  className="w-full h-44 object-cover rounded-lg border-2 border-amber-400"
                />
              ) : (
                <div className="w-full h-44 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-700 dark:text-slate-300 font-bold">
                  {t.normalizing_processing}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{t.crop_applied}</span>
            </p>

            <button
              id="btn-retake-photo"
              onClick={handleRetake}
              className={`box-interactive-green px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0F172A] text-slate-200'
                  : 'bg-white text-slate-950 shadow-xs'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.retake_photo}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for video frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
