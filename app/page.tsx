'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Station } from '@/types/station';
import Navbar from '@/components/Navbar';
import FuelTicker from '@/components/FuelTicker';
import SearchFilter from '@/components/SearchFilter';
import StationCard from '@/components/StationCard';
import ReportModal from '@/components/ReportModal';
import AddStationModal from '@/components/AddStationModal';

// Dynamically import the map to prevent SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

function getOverallStatus(station: Station): 'available' | 'limited' | 'unavailable' {
  const statuses = station.fuelTypes.map(f => f.status);
  if (statuses.some(s => s === 'available')) return 'available';
  if (statuses.some(s => s === 'limited')) return 'limited';
  return 'unavailable';
}

export default function DashboardPage() {
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [reportTarget, setReportTarget] = useState<Station | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Stats computed from all stations
  const stats = {
    total: allStations.length,
    available: allStations.filter(s => getOverallStatus(s) === 'available').length,
    limited: allStations.filter(s => getOverallStatus(s) === 'limited').length,
    unavailable: allStations.filter(s => getOverallStatus(s) === 'unavailable').length,
  };

  const fetchStations = useCallback(() => {
    fetch('/api/stations')
      .then(r => r.json())
      .then(data => {
        setAllStations(data.stations);
        // We don't overwrite filteredStations here directly without keeping search params,
        // but SearchFilter's useEffect will re-run automatically since `allStations` changes 
        // and it is passed as a prop: <SearchFilter stations={allStations} ... />
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleFilterChange = useCallback((filtered: Station[]) => {
    setFilteredStations(filtered);
  }, []);

  const handleReportSubmit = () => {
    setReportTarget(null);
    setShowSuccess(true);
    fetchStations(); // Refetch stations to update the UI globally
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleDelete = async (station: Station) => {
    if (window.confirm(`Are you sure you want to permanently delete '${station.name}'?`)) {
      try {
        const res = await fetch('/api/stations/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stationId: station.id })
        });
        if (res.ok) {
          setShowSuccess(true);
          fetchStations();
          if (selectedStation?.id === station.id) {
            setSelectedStation(null);
            setShowMobileMap(false);
          }
        } else {
          alert('Failed to delete station.');
        }
      } catch {
        alert('Network error.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <FuelTicker />

      {/* Main layout — starts below navbar (64px) + ticker (36px) = 100px */}
      <div className="fixed inset-0 top-[100px] flex flex-col md:flex-row">

        {/* ── LEFT PANEL: Sidebar ── */}
        <aside
          className={`
            flex-shrink-0 w-full md:w-[360px] lg:w-[400px]
            flex flex-col bg-gray-950 border-r border-gray-800/60
            ${showMobileMap ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Stats bar */}
          <div className="flex-shrink-0 grid grid-cols-4 gap-px bg-gray-800/40 border-b border-gray-800/60">
            {[
              { label: 'Total', value: stats.total, color: 'text-indigo-400' },
              { label: 'Available', value: stats.available, color: 'text-emerald-400' },
              { label: 'Limited', value: stats.limited, color: 'text-yellow-400' },
              { label: 'No Fuel', value: stats.unavailable, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center py-2.5 bg-gray-900/60">
                <span className={`text-lg font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
                <span className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Search & Filter & Add Station */}
          <div className="flex-shrink-0 p-3 border-b border-gray-800/60 flex flex-col gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add New Station
            </button>
            <SearchFilter stations={allStations} onFilterChange={handleFilterChange} />
          </div>

          {/* Station List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-3 p-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 rounded-xl bg-gray-800/40 animate-pulse" />
                ))}
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 font-semibold text-sm">No stations found</p>
                <p className="text-gray-600 text-xs">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold px-1">
                  {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
                </p>
                {filteredStations.map(station => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSelected={selectedStation?.id === station.id}
                    onSelect={s => { setSelectedStation(s); setShowMobileMap(true); }}
                    onReport={setReportTarget}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile: toggle map/list button */}
          <div className="md:hidden flex-shrink-0 p-3 border-t border-gray-800/60">
            <button
              id="mobile-toggle-map"
              onClick={() => setShowMobileMap(v => !v)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Map
            </button>
          </div>
        </aside>

        {/* ── RIGHT PANEL: Map ── */}
        <main
          className={`
            flex-1 relative
            ${showMobileMap ? 'flex' : 'hidden md:flex'}
            flex-col
          `}
        >
          {/* Mobile: back to list button */}
          <div className="md:hidden absolute top-3 left-3 z-[1000]">
            <button
              id="mobile-back-to-list"
              onClick={() => setShowMobileMap(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-gray-600/50 text-sm text-gray-300 font-medium shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Station List
            </button>
          </div>

          <div className="w-full h-full">
            <MapView
              stations={filteredStations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          </div>
        </main>
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          station={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Add Station Modal */}
      {showAddModal && (
        <AddStationModal
          onClose={() => setShowAddModal(false)}
          onSubmit={() => {
            setShowAddModal(false);
            setShowSuccess(true);
            fetchStations();
          }}
        />
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300">Report Submitted!</p>
            <p className="text-xs text-gray-500">Thank you for helping the community.</p>
          </div>
        </div>
      )}
    </>
  );
}
