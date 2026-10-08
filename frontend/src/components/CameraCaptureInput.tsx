import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onCaptureSourceChange?: (source: 'CAMERA' | 'UPLOAD') => void;
}

export const CameraCaptureInput: React.FC<Props> = ({ 
  onFileSelect, 
  selectedFile,
  onCaptureSourceChange 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'CAMERA' | 'UPLOAD'>('UPLOAD');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'CAMERA' | 'UPLOAD') => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setActiveSource(source);
      if (onCaptureSourceChange) onCaptureSourceChange(source);
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    onFileSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          Visual Evidence <span className="text-xs text-slate-400 font-normal">(Optional)</span>
        </label>
        {selectedFile && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
          >
            <X className="w-3.5 h-3.5" /> Remove photo
          </button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video max-h-64 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Report evidence preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center justify-between">
            <span className="truncate max-w-[200px] flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {activeSource}
              </span>
              <span className="truncate">{selectedFile?.name}</span>
            </span>
            <span className="text-cyan-400 font-mono">
              {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mobile Camera Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/60 hover:bg-slate-900 transition group"
          >
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium text-slate-200">Take Photo</span>
              <span className="block text-xs text-slate-400">Launch live device camera</span>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'CAMERA')}
              className="hidden"
            />
          </button>

          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900 transition group"
          >
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium text-slate-200">Upload Image</span>
              <span className="block text-xs text-slate-400">JPEG, PNG, WEBP from device</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'UPLOAD')}
              className="hidden"
            />
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400">
        You may submit without a photo if visual evidence cannot be safely captured.
      </p>
    </div>
  );
};
