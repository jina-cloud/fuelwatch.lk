'use client';

import { useEffect, useRef } from 'react';
import type { Station } from '@/types/station';

interface MapViewProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}

const statusColors = {
  available: '#22c55e',
  limited: '#eab308',
  unavailable: '#ef4444',
};

function getOverallStatus(station: Station): 'available' | 'limited' | 'unavailable' {
  const statuses = station.fuelTypes.map(f => f.status);
  if (statuses.some(s => s === 'available')) return 'available';
  if (statuses.some(s => s === 'limited')) return 'limited';
  return 'unavailable';
}

function createMarkerSvg(color: string, selected: boolean): string {
  const size = selected ? 20 : 14;
  const outerR = selected ? 10 : 7;
  const innerR = selected ? 6 : 4;
  return `<svg width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size}" cy="${size}" r="${outerR}" fill="${color}" opacity="0.25"/>
    <circle cx="${size}" cy="${size}" r="${innerR}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`;
}

export default function MapView({ stations, selectedStation, onSelectStation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    async function initMap() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [7.8731, 80.7718],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      stations.forEach(station => addMarker(L, map, station, false));
    }

    function addMarker(L: any, map: import('leaflet').Map, station: Station, selected: boolean) {
      const status = getOverallStatus(station);
      const color = statusColors[status];
      const svgString = createMarkerSvg(color, selected);
      const size = selected ? 40 : 28;

      const icon = L.divIcon({
        html: svgString,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2)],
      });

      const popupContent = `
        <div style="min-width:220px; font-family: system-ui, sans-serif;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <h3 style="font-size:14px; font-weight:700; color:#f1f5f9; margin:0; line-height:1.3;">${station.name}</h3>
            <span style="font-size:10px; background:${color}25; color:${color}; border:1px solid ${color}40; border-radius:6px; padding:2px 8px; font-weight:600; white-space:nowrap; margin-left:8px; text-transform:uppercase;">${status}</span>
          </div>
          <p style="color:#64748b; font-size:11px; margin:0 0 10px 0;">📍 ${station.address}</p>
          <div style="display:grid; gap:4px;">
            ${station.fuelTypes.map(f => {
              const fc = statusColors[f.status as keyof typeof statusColors];
              return `<div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; border-radius:6px; padding:5px 8px;">
                <span style="color:#94a3b8; font-size:11px;">${f.type}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="color:#cbd5e0; font-size:11px; font-weight:600;">Rs. ${f.price}/L</span>
                  <span style="color:${fc}; font-size:10px; font-weight:700; text-transform:uppercase;">${f.status}</span>
                </div>
              </div>`;
            }).join('')}
          </div>
          <p style="color:#475569; font-size:10px; margin:10px 0 0 0;">🕐 Updated: ${new Date(station.lastUpdated).toLocaleTimeString('en-LK', {hour:'2-digit', minute:'2-digit'})} &middot; ${station.reportCount} reports</p>
        </div>
      `;

      const marker = L.marker([station.lat, station.lng], { icon })
        .bindPopup(popupContent, { maxWidth: 280 })
        .addTo(map);

      marker.on('click', () => {
        onSelectStation(station);
      });

      markersRef.current.set(station.id, marker);
    }

    initMap();
  }, []);

  // Update markers when stations change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current!;

      // Remove old markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current.clear();

      stations.forEach(station => {
        const status = getOverallStatus(station);
        const color = statusColors[status];
        const isSelected = selectedStation?.id === station.id;
        const svgString = createMarkerSvg(color, isSelected);
        const size = isSelected ? 40 : 28;

        const icon = L.divIcon({
          html: svgString,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)],
        });

        const popupContent = `
          <div style="min-width:220px; font-family: system-ui, sans-serif;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <h3 style="font-size:14px; font-weight:700; color:#f1f5f9; margin:0; line-height:1.3;">${station.name}</h3>
              <span style="font-size:10px; background:${color}25; color:${color}; border:1px solid ${color}40; border-radius:6px; padding:2px 8px; font-weight:600; white-space:nowrap; margin-left:8px; text-transform:uppercase;">${status}</span>
            </div>
            <p style="color:#64748b; font-size:11px; margin:0 0 10px 0;">📍 ${station.address}</p>
            <div style="display:grid; gap:4px;">
              ${station.fuelTypes.map(f => {
                const fc = statusColors[f.status as keyof typeof statusColors];
                return `<div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; border-radius:6px; padding:5px 8px;">
                  <span style="color:#94a3b8; font-size:11px;">${f.type}</span>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:#cbd5e0; font-size:11px; font-weight:600;">Rs. ${f.price}/L</span>
                    <span style="color:${fc}; font-size:10px; font-weight:700; text-transform:uppercase;">${f.status}</span>
                  </div>
                </div>`;
              }).join('')}
            </div>
            <p style="color:#475569; font-size:10px; margin:10px 0 0 0;">🕐 Updated: ${new Date(station.lastUpdated).toLocaleTimeString('en-LK', {hour:'2-digit', minute:'2-digit'})} &middot; ${station.reportCount} reports</p>
          </div>
        `;

        const marker = L.marker([station.lat, station.lng], { icon })
          .bindPopup(popupContent, { maxWidth: 280 })
          .addTo(map);

        marker.on('click', () => onSelectStation(station));
        markersRef.current.set(station.id, marker);
      });
    }

    updateMarkers();
  }, [stations, selectedStation]);

  // Fly to selected station
  useEffect(() => {
    if (!selectedStation || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedStation.lat, selectedStation.lng], 13, { duration: 1 });
    const marker = markersRef.current.get(selectedStation.id);
    if (marker) setTimeout(() => marker.openPopup(), 1000);
  }, [selectedStation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-3 flex flex-col gap-1.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Fuel Status</p>
        {[
          { color: '#22c55e', label: 'Available' },
          { color: '#eab308', label: 'Limited' },
          { color: '#ef4444', label: 'Unavailable' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
