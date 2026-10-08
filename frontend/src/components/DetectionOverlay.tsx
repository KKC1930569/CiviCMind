import React, { useState } from 'react';
import type { YOLODetectionItem } from '../types';
import { API_BASE_URL } from '../api/client';

interface DetectionOverlayProps {
  imageUrl: string;
  detections?: YOLODetectionItem[];
  alt?: string;
  className?: string;
  maxHeight?: string;
}

const CLASS_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  pothole: {
    border: 'border-amber-400',
    bg: 'bg-amber-500/90',
    text: 'text-amber-950 font-bold',
  },
  longitudinal_crack: {
    border: 'border-orange-400',
    bg: 'bg-orange-500/90',
    text: 'text-orange-950 font-bold',
  },
  transverse_crack: {
    border: 'border-orange-400',
    bg: 'bg-orange-500/90',
    text: 'text-orange-950 font-bold',
  },
  alligator_crack: {
    border: 'border-red-400',
    bg: 'bg-red-500/90',
    text: 'text-red-950 font-bold',
  },
  damaged_traffic_light: {
    border: 'border-cyan-400',
    bg: 'bg-cyan-400/90',
    text: 'text-cyan-950 font-bold',
  },
  water_leak: {
    border: 'border-sky-400',
    bg: 'bg-sky-400/90',
    text: 'text-sky-950 font-bold',
  },
};

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  imageUrl,
  detections = [],
  alt = 'Evidence detection',
  className = '',
  maxHeight = 'max-h-80',
}) => {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setNaturalSize({ width: naturalWidth, height: naturalHeight });
    }
  };

  // Convert relative /api/uploads/ to full URL if needed
  const resolvedUrl = imageUrl.startsWith('blob:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')
    ? imageUrl
    : `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center ${className}`}>
      <div className="relative inline-block w-full">
        <img
          src={resolvedUrl}
          alt={alt}
          onLoad={handleImageLoad}
          className={`w-full h-auto object-contain block select-none ${maxHeight}`}
        />

        {naturalSize && detections.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {detections.map((det, idx) => {
              const { x1, y1, x2, y2 } = det.bbox;
              const leftPct = (x1 / naturalSize.width) * 100;
              const topPct = (y1 / naturalSize.height) * 100;
              const widthPct = ((x2 - x1) / naturalSize.width) * 100;
              const heightPct = ((y2 - y1) / naturalSize.height) * 100;

              const color = CLASS_COLORS[det.class_name.toLowerCase()] || {
                border: 'border-cyan-400',
                bg: 'bg-cyan-500/90',
                text: 'text-cyan-950 font-bold',
              };

              return (
                <div
                  key={idx}
                  style={{
                    left: `${Math.max(0, leftPct)}%`,
                    top: `${Math.max(0, topPct)}%`,
                    width: `${Math.min(100 - leftPct, widthPct)}%`,
                    height: `${Math.min(100 - topPct, heightPct)}%`,
                  }}
                  className={`absolute border-2 ${color.border} rounded-sm shadow-md transition-all duration-200 pointer-events-auto group`}
                >
                  {/* Badge */}
                  <div
                    className={`absolute -top-6 left-0 ${color.bg} ${color.text} text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 whitespace-nowrap z-10`}
                  >
                    <span>{det.class_name.replace(/_/g, ' ')}</span>
                    <span className="opacity-90 font-mono">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
