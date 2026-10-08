import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Check,
  VideoOff,
  SwitchCamera
} from 'lucide-react';
import type { YOLODetectionItem } from '../types';
import { DetectionOverlay } from './DetectionOverlay';

export type AIScanStage = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

interface Props {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onCaptureSourceChange?: (source: 'CAMERA' | 'UPLOAD') => void;
  detections?: YOLODetectionItem[];
  scanStage?: AIScanStage;
  scanMessage?: string;
}

export const CameraCaptureInput: React.FC<Props> = ({ 
  onFileSelect, 
  selectedFile,
  onCaptureSourceChange,
  detections = [],
  scanStage = 'idle',
  scanMessage
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'UPLOAD'>('CAMERA');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'CAMERA' | 'UPLOAD'>('CAMERA');

  // Live Camera Stream State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Unconfirmed captured photo state (between capture and "Use This Photo")
  const [unconfirmedCameraFile, setUnconfirmedCameraFile] = useState<File | null>(null);
  const [unconfirmedCameraUrl, setUnconfirmedCameraUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview URL when confirmed selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Sync unconfirmed camera URL
  useEffect(() => {
    if (unconfirmedCameraFile) {
      const url = URL.createObjectURL(unconfirmedCameraFile);
      setUnconfirmedCameraUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setUnconfirmedCameraUrl(null);
    }
  }, [unconfirmedCameraFile]);

  // Clean stop for media stream
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Ensure video element plays stream once active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.warn('Camera video play note:', err));
      }
    }
  }, [isCameraActive]);

  // Start live browser camera stream
  const startCameraStream = useCallback(async (desiredFacing: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Please switch to "Upload Image".');
      setCameraLoading(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: desiredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback without constraints for universal webcam / desktop support
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('Camera access notice:', err);
      let errorMsg = 'Could not access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera access in your browser or switch to "Upload Image".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device. Please use "Upload Image".';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is in use by another application. Please close other camera apps and retry.';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
      setCameraLoading(false);
    }
  }, [facingMode, stopCameraStream]);

  // Toggle Front / Back camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  // Handle Tab Switch
  const handleSelectTab = (tab: 'CAMERA' | 'UPLOAD') => {
    setActiveTab(tab);
    setUnconfirmedCameraFile(null);
    if (tab === 'UPLOAD') {
      stopCameraStream();
    } else if (tab === 'CAMERA') {
      if (!selectedFile) {
        startCameraStream(facingMode);
      }
    }
  };

  // Capture frame from live video to a File object
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Camera is not ready yet. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image/jpeg Blob -> File
    canvas.toBlob((blob) => {
      if (!blob) return;
      const filename = `camera_capture_${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      // Stop camera stream once photo is taken
      stopCameraStream();

      // Place in unconfirmed state to allow user to review: [ Retake ] [ Use This Photo ]
      setUnconfirmedCameraFile(file);
    }, 'image/jpeg', 0.92);
  };

  // User confirms the captured camera photo
  const handleConfirmCapturedPhoto = () => {
    if (!unconfirmedCameraFile) return;
    setActiveSource('CAMERA');
    onCaptureSourceChange?.('CAMERA');
    onFileSelect(unconfirmedCameraFile);
    setUnconfirmedCameraFile(null);
  };

  // User discards captured photo and retakes
  const handleRetakeCamera = () => {
    setUnconfirmedCameraFile(null);
    startCameraStream(facingMode);
  };

  // Handle Normal File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setActiveSource('UPLOAD');
      onCaptureSourceChange?.('UPLOAD');
      onFileSelect(file);
    }
  };

  // Retake or Clear confirmed photo
  const handleRetakeConfirmed = () => {
    onFileSelect(null);
    setUnconfirmedCameraFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (activeSource === 'CAMERA') {
      setActiveTab('CAMERA');
      startCameraStream(facingMode);
    } else {
      setActiveTab('UPLOAD');
      fileInputRef.current?.click();
    }
  };

  const handleClear = () => {
    stopCameraStream();
    onFileSelect(null);
    setUnconfirmedCameraFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Evidence Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Infrastructure Visual Evidence
          </label>
          <p className="text-xs text-slate-400">
            Provide a photo via device camera or file upload for AI hazard detection.
          </p>
        </div>

        {(selectedFile || unconfirmedCameraFile) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20"
          >
            <X className="w-3.5 h-3.5" /> Remove Photo
          </button>
        )}
      </div>

      {/* Two Clearly Separate Options: [ 📷 Take Photo ]  [ 🖼 Upload Image ] */}
      {!selectedFile && !unconfirmedCameraFile && (
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectTab('CAMERA')}
            className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'CAMERA'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo / Camera</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('UPLOAD')}
            className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'UPLOAD'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>
      )}

      {/* FLOW 1: Photo Preview After Camera Capture (Review state: [ Retake ] [ Use This Photo ]) */}
      {unconfirmedCameraFile && unconfirmedCameraUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 min-h-[240px] flex items-center justify-center shadow-lg">
            <img
              src={unconfirmedCameraUrl}
              alt="Camera photo preview"
              className="w-full h-auto object-contain max-h-96 block select-none"
            />
            <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-300 border border-slate-800 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>PHOTO PREVIEW</span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-300 flex items-center justify-between border border-slate-800">
              <span className="truncate text-slate-200 font-mono text-[11px]">
                {unconfirmedCameraFile.name}
              </span>
              <span className="text-cyan-400 font-mono text-xs">
                {(unconfirmedCameraFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Buttons: [ Retake ] [ Use This Photo ] */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRetakeCamera}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Retake</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmCapturedPhoto}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Use This Photo</span>
            </button>
          </div>
        </div>
      ) : selectedFile && previewUrl ? (
        /* FLOW 2: Confirmed Photo (Camera or Upload) with AI YOLO Detection Overlay */
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 min-h-[240px] flex items-center justify-center shadow-lg">
            {/* Image Preview with real YOLO bounding boxes */}
            <DetectionOverlay
              imageUrl={previewUrl}
              detections={scanStage === 'complete' ? detections : []}
              alt="Report evidence preview"
              maxHeight="max-h-96"
            />

            {/* AI Scanning Overlay States */}
            {scanStage === 'uploading' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  Uploading Image...
                </span>
                <span className="text-[11px] text-slate-400">
                  Sending file to CivicMind server
                </span>
              </div>
            )}

            {scanStage === 'analyzing' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur animate-ping" />
                </div>
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  Analyzing with Trained YOLO Model...
                </span>
                <span className="text-[11px] text-slate-400">
                  Scanning for potholes, surface cracks, traffic lights & leaks
                </span>
              </div>
            )}

            {/* Bottom info strip */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-300 flex items-center justify-between z-10 border border-slate-800">
              <span className="truncate max-w-[220px] flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-semibold">
                  {activeSource === 'CAMERA' ? 'Live Camera Capture' : 'Uploaded File'}
                </span>
                <span className="truncate text-slate-200">{selectedFile.name}</span>
              </span>
              <span className="text-cyan-400 font-mono text-xs">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Action Ribbon: Retake / Change File */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRetakeConfirmed}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>{activeSource === 'CAMERA' ? 'Retake Photo' : 'Choose Different File'}</span>
            </button>

            <div className="py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Photo Attached</span>
            </div>
          </div>

          {/* AI Scan Feedback Banner */}
          {scanStage === 'complete' && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              detections.length > 0 
                ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-900/60 border-slate-700 text-slate-300'
            }`}>
              {detections.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <span>AI Detection Complete</span>
                  {detections.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      {detections.length} defect{detections.length > 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {scanMessage || (
                    detections.length > 0 
                      ? `Detected ${detections.map(d => `${d.class_name.replace(/_/g, ' ')} (${(d.confidence * 100).toFixed(0)}%)`).join(', ')}. Category and severity have been auto-assigned.`
                      : 'No defect detected above threshold. You can manually classify this report.'
                  )}
                </p>
              </div>
            </div>
          )}

          {scanStage === 'error' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scanMessage || 'AI analysis unavailable. You can still submit your report manually.'}</span>
            </div>
          )}
        </div>
      ) : activeTab === 'CAMERA' ? (
        /* FLOW 3: Live Camera Preview Mode */
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video max-h-80 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Camera loading state */}
            {cameraLoading && (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-semibold">Opening device camera...</span>
                <span className="text-[10px] text-slate-500">Please grant camera permission in your browser</span>
              </div>
            )}

            {/* Camera Initial State (before permission granted or stream started) */}
            {!isCameraActive && !cameraLoading && !cameraError && (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200">Live Device Camera</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Access your camera to capture live road, pavement, or signage hazards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startCameraStream(facingMode)}
                  className="mt-1 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-500/20 transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>
              </div>
            )}

            {/* Camera Error State */}
            {cameraError && (
              <div className="p-6 text-center space-y-3 max-w-sm">
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mx-auto w-fit">
                  <VideoOff className="w-6 h-6" />
                </div>
                <div className="text-xs text-rose-200 leading-relaxed">
                  {cameraError}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startCameraStream(facingMode)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('UPLOAD')}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold"
                  >
                    Switch to Upload Image
                  </button>
                </div>
              </div>
            )}

            {/* Live Camera Viewfinder Overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/30 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[11px] font-mono text-cyan-300 bg-slate-950/70 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1.5" />
                    LIVE CAMERA PREVIEW
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-950/70 px-2 py-1 rounded-md backdrop-blur-sm uppercase">
                    {facingMode === 'environment' ? 'Back' : 'Front'} Camera
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* [ Capture Photo ] and [ Switch Camera ] Controls */}
          {isCameraActive && (
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs transition"
                title="Switch Front/Back Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={stopCameraStream}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-400 text-xs transition"
                title="Stop Camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* FLOW 4: Normal File Upload Mode */
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/80 transition cursor-pointer flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="block text-sm font-semibold text-slate-200">
                Click to browse or drag & drop an image
              </span>
              <span className="block text-xs text-slate-400">
                Supports JPG, JPEG, PNG, WEBP, or GIF (up to 20MB)
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
