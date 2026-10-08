import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, X, LocateFixed } from 'lucide-react';

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  readOnly?: boolean;
  onLocationChange?: (lat: number | null, lng: number | null, type: 'GPS' | 'MAP' | 'NONE') => void;
  height?: string;
  zoom?: number;
}

// Custom SVG-based Leaflet DivIcon to avoid missing PNG asset issues
const createPinIcon = (color: string = '#06b6d4') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #0f172a;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const LocationPickerMap: React.FC<Props> = ({
  latitude,
  longitude,
  readOnly = false,
  onLocationChange,
  height = '320px',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Default coordinate center (Chennai, Tamil Nadu, India: 13.0418, 80.2341 or provided coords)
  const defaultLat = latitude ?? 13.0418;
  const defaultLng = longitude ?? 80.2341;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: zoom,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add clean attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors')
        .addTo(map);

      mapInstanceRef.current = map;

      // Click event for interactive picking
      if (!readOnly && onLocationChange) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          onLocationChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)), 'MAP');
        });
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync marker whenever latitude or longitude change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (latitude != null && longitude != null) {
      if (!markerRef.current) {
        markerRef.current = L.marker([latitude, longitude], {
          icon: createPinIcon('#06b6d4'),
        }).addTo(map);
      } else {
        markerRef.current.setLatLng([latitude, longitude]);
      }
      map.setView([latitude, longitude], map.getZoom() > 14 ? map.getZoom() : 15);
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitude, longitude]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (onLocationChange) {
          onLocationChange(lat, lng, 'GPS');
        }
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(`Unable to retrieve GPS: ${err.message}. You can still click directly on the map.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    if (onLocationChange) {
      onLocationChange(null, null, 'NONE');
    }
  };

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Location Tagging <span className="text-slate-400 font-normal">(Optional)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition text-xs font-medium"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              {geoLoading ? 'Locating...' : 'Use My GPS'}
            </button>

            {latitude != null && longitude != null && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {geoError && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
          {geoError}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-inner z-0 relative"
      />

      {latitude != null && longitude != null ? (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
            <LocateFixed className="w-3.5 h-3.5" />
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
          <span className="text-slate-400">
            {!readOnly && 'Click anywhere to reposition pin'}
          </span>
        </div>
      ) : (
        !readOnly && (
          <p className="text-xs text-slate-400">
            Click anywhere on the map or tap "Use My GPS" to pin the incident. GPS is not required.
          </p>
        )
      )}
    </div>
  );
};
