'use client';

import type { Station, FuelType } from '@/types/station';

interface StationCardProps {
  station: Station;
  isSelected: boolean;
  onSelect: (station: Station) => void;
  onReport: (station: Station) => void;
  onDelete?: (station: Station) => void;
}

const statusBadge: Record<string, string> = {
  available: 'badge-available',
  limited: 'badge-limited',
  unavailable: 'badge-unavailable',
};

const statusLabel: Record<string, string> = {
  available: '● Available',
  limited: '● Limited',
  unavailable: '● Out of Stock',
};

const brandColors: Record<string, string> = {
  'CPC': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Lanka IOC': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Sinopec': 'bg-red-500/15 text-red-400 border-red-500/25',
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

function getOverallStatus(station: Station): 'available' | 'limited' | 'unavailable' {
  const statuses = station.fuelTypes.map(f => f.status);
  if (statuses.some(s => s === 'available')) return 'available';
  if (statuses.some(s => s === 'limited')) return 'limited';
  return 'unavailable';
}

export default function StationCard({ station, isSelected, onSelect, onReport, onDelete }: StationCardProps) {
  const overall = getOverallStatus(station);

  return (
    <div
      className={`station-card rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden
        ${isSelected
          ? 'border-indigo-500/60 bg-indigo-500/5'
          : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600/60 hover:bg-gray-800/60'
        }`}
      onClick={() => onSelect(station)}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-100 leading-tight truncate">{station.name}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">📍 {station.city} · {station.address}</p>
          </div>
          <span className={`flex-shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide ${statusBadge[overall]}`}>
            {overall === 'available' ? '✓' : overall === 'limited' ? '!' : '✗'} {overall}
          </span>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${brandColors[station.brand] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
            {station.brand}
          </span>
          <span className="text-[10px] text-gray-600">
            Updated {timeAgo(station.lastUpdated)} · {station.reportCount} reports
          </span>
        </div>

        {/* Fuel grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {station.fuelTypes.map((ft: FuelType) => (
            <div key={ft.type} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-2 py-1.5">
              <span className="text-[10px] text-gray-400 truncate mr-1">{ft.type}</span>
              <span className={`text-[9px] font-bold uppercase ${
                ft.status === 'available' ? 'text-emerald-400' :
                ft.status === 'limited' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {ft.status === 'available' ? '✓' : ft.status === 'limited' ? '~' : '✗'}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            id={`report-btn-${station.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-all duration-150"
            onClick={e => { e.stopPropagation(); onReport(station); }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Report
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 border border-gray-600/30 text-gray-400 hover:text-gray-300 text-xs transition-all duration-150"
            onClick={e => { e.stopPropagation(); onSelect(station); }}
          >
            Map
          </button>
          {onDelete && (
            <button
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all duration-150"
              onClick={e => { e.stopPropagation(); onDelete(station); }}
              title="Delete Station"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
