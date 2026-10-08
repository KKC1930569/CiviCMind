import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Report } from '../types';

interface Props {
  reports: Report[];
  height?: string;
  selectedReportId?: number | null;
  onSelectReport?: (report: Report) => void;
}

const getPriorityColor = (priority: string, score: number): string => {
  const normScore = score <= 10.0 && score > 0 ? score * 10 : score;
  if (priority === 'CRITICAL' || normScore >= 80) return '#f43f5e'; // Rose-500
  if (priority === 'HIGH' || normScore >= 60) return '#f59e0b';     // Amber-500
  if (priority === 'MEDIUM' || normScore >= 30) return '#eab308';   // Yellow-500
  return '#3b82f6';                                                 // Blue-500
};

export const CommunityIncidentMap: React.FC<Props> = ({
  reports,
  height = '420px',
  selectedReportId,
  onSelectReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.0418, 80.2341], // Chennai, Tamil Nadu, India
      zoom: 13,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: 'bottomright' })
      .addAttribution('&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>')
      .addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: [number, number][] = [];

    reports.forEach((rep) => {
      if (rep.latitude != null && rep.longitude != null) {
        bounds.push([rep.latitude, rep.longitude]);
        const normScore = Math.round(rep.human_impact_score <= 10.0 && rep.human_impact_score > 0 ? rep.human_impact_score * 10 : rep.human_impact_score);
        const color = getPriorityColor(rep.priority_level, normScore);
        const isSelected = selectedReportId === rep.id;
        const isCritical = rep.priority_level === 'CRITICAL' || normScore >= 80;

        const pinIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${isSelected ? '40px' : isCritical ? '36px' : '30px'};
              height: ${isSelected ? '40px' : isCritical ? '36px' : '30px'};
              background: ${color};
              color: white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: ${isCritical ? '0 0 16px rgba(244, 63, 94, 0.7)' : '0 4px 12px rgba(0,0,0,0.5)'};
              border: ${isSelected ? '3px solid #38bdf8' : '2px solid #ffffff'};
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); font-size: ${isSelected ? '12px' : isCritical ? '11px' : '9px'}; font-weight: 800; font-family: monospace;">
                ${normScore}
              </span>
            </div>
          `,
          iconSize: [isSelected ? 40 : 36, isSelected ? 40 : 36],
          iconAnchor: [isSelected ? 20 : 18, isSelected ? 40 : 36],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon: pinIcon });

        const repeatBadge = rep.is_repeated_issue || rep.repeat_count > 0
          ? `<span style="background: #fef08a; color: #854d0e; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 4px;">REPEATED (${rep.repeat_count})</span>`
          : '';

        const accBadge = rep.accessibility_barrier && rep.accessibility_barrier !== 'NONE'
          ? `<span style="background: #e0e7ff; color: #3730a3; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 4px;">♿ ${rep.accessibility_barrier}</span>`
          : '';

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 6px; min-width: 210px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">
                ${rep.priority_level || 'PRIORITY'} (${normScore}/100)
              </span>
              <span style="background: #e2e8f0; font-size: 10px; padding: 2px 5px; border-radius: 4px; font-weight: 600;">
                ${rep.status}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 700; margin: 4px 0; color: #0f172a; line-height: 1.3;">
              ${rep.title}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              <strong>Category:</strong> ${rep.category} | <strong>Severity:</strong> ${rep.severity || 'MEDIUM'}
            </div>
            <div style="margin-bottom: 6px;">
              ${accBadge}
              ${repeatBadge}
            </div>
            <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              ${rep.address || `${rep.latitude.toFixed(4)}, ${rep.longitude.toFixed(4)}`}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectReport) {
            onSelectReport(rep);
          }
        });

        layer.addLayer(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [reports, selectedReportId]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-0"
    />
  );
};
