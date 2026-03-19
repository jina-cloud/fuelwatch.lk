'use client';

import { useState, useEffect } from 'react';

interface AddStationModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

import { DISTRICTS, DISTRICT_CITIES } from '@/lib/constants';

const BRANDS = ['CPC', 'Lanka IOC', 'Sinopec'];
const FUEL_TYPES = ['92 Octane', '95 Octane', 'Diesel', 'Super Diesel'];
const STATUSES = ['available', 'limited', 'unavailable'];

const statusLabels: Record<string, string> = {
  available: '🟢 Available',
  limited: '🟡 Limited',
  unavailable: '🔴 Out of Stock',
};

const defaultFuelPrices: Record<string, number> = {
  '92 Octane': 317,
  '95 Octane': 377,
  'Diesel': 273,
  'Super Diesel': 385
};

export default function AddStationModal({ onClose, onSubmit }: AddStationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('CPC');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState(DISTRICT_CITIES['Colombo'][0]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('6.9271');
  const [lng, setLng] = useState('79.8612');

  // Fuel Availability State
  const [fuelStatuses, setFuelStatuses] = useState<Record<string, string>>({
    '92 Octane': 'unavailable',
    '95 Octane': 'unavailable',
    'Diesel': 'unavailable',
    'Super Diesel': 'unavailable',
  });

  // Watch for district change and reset city
  useEffect(() => {
    if (district && DISTRICT_CITIES[district] && !DISTRICT_CITIES[district].includes(city)) {
      setCity(DISTRICT_CITIES[district][0]);
    }
  }, [district]);

  const handleFuelStatusChange = (fuelType: string, status: string) => {
    setFuelStatuses(prev => ({ ...prev, [fuelType]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !address || !lat || !lng) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);

    // Format fuel types for payload
    const fuelTypes = FUEL_TYPES.map(ft => ({
      type: ft,
      status: fuelStatuses[ft],
      price: defaultFuelPrices[ft]
    }));

    try {
      const res = await fetch('/api/stations/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, brand, city, district, address, lat, lng, fuelTypes
        }),
      });

      if (res.ok) {
        onSubmit();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add station. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop bg-black/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl glass border border-gray-600/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-gray-900/80">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Add New Station</h2>
            <p className="text-xs text-gray-500 mt-0.5">Register a new fuel station to the map</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-indigo-400 border-b border-gray-700/50 pb-1">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Station Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lanka IOC Mount Lavinia" className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Brand *</label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer">
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">District *</label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer">
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">City *</label>
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer">
                {(DISTRICT_CITIES[district] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Address *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Galle Road, Mount Lavinia" className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition" />
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-indigo-400 border-b border-gray-700/50 pb-1">GPS Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Latitude *</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 6.8398" className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Longitude *</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="e.g. 79.8655" className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">You can copy coordinates directly from Google Maps.</p>
          </div>

          {/* Section: Fuel Availability */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-indigo-400 border-b border-gray-700/50 pb-1">Initial Fuel Availability</h3>
            <div className="grid grid-cols-1 gap-2">
              {FUEL_TYPES.map(ft => (
                <div key={ft} className="flex items-center justify-between bg-gray-800/40 p-2 rounded-lg border border-gray-700/50">
                  <span className="text-sm font-medium text-gray-300 w-1/3">{ft}</span>
                  <div className="flex gap-1 w-2/3">
                    {STATUSES.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleFuelStatusChange(ft, status)}
                        className={`flex-1 text-[10px] py-1.5 rounded-md font-semibold transition-all border ${
                          fuelStatuses[ft] === status 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {status === 'available' ? 'Available' : status === 'limited' ? 'Limited' : 'None'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700/50 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600/50 text-sm text-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white font-semibold transition shadow-lg shadow-indigo-500/20"
            >
              {submitting ? 'Adding...' : 'Add Station'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
