'use client';

import { useState } from 'react';
import type { Station } from '@/types/station';

interface ReportModalProps {
  station: Station | null;
  onClose: () => void;
  onSubmit: () => void;
}

const FUEL_TYPES = ['92 Octane', '95 Octane', 'Diesel', 'Super Diesel'];
const AVAILABILITY_OPTIONS = [
  { value: 'available', label: '🟢 Available', desc: 'Fuel is in stock, short or no queue' },
  { value: 'limited', label: '🟡 Limited', desc: 'Low stock or long queue (>30 min)' },
  { value: 'unavailable', label: '🔴 Out of Stock', desc: 'No fuel available at this time' },
];

export default function ReportModal({ station, onClose, onSubmit }: ReportModalProps) {
  const [fuelType, setFuelType] = useState('');
  const [availability, setAvailability] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!station) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelType) { setError('Please select a fuel type.'); return; }
    if (!availability) { setError('Please select availability status.'); return; }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          fuelType,
          availability,
          comment,
        }),
      });

      if (res.ok) {
        onSubmit();
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl glass border border-gray-600/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50">
          <div>
            <h2 className="text-base font-bold text-gray-100">Report Fuel Availability</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">{station.name}</p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Fuel type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Fuel Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {FUEL_TYPES.map(ft => (
                <button
                  key={ft}
                  type="button"
                  id={`fuel-type-${ft.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setFuelType(ft)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150
                    ${fuelType === ft
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-gray-600/50 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                    }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Availability *</label>
            <div className="flex flex-col gap-2">
              {AVAILABILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  id={`availability-${opt.value}`}
                  onClick={() => setAvailability(opt.value)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-150
                    ${availability === opt.value
                      ? 'border-indigo-500/60 bg-indigo-500/10'
                      : 'border-gray-600/50 bg-gray-800/50 hover:border-gray-500'
                    }`}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-200 block">{opt.label}</span>
                    <span className="text-[10px] text-gray-500">{opt.desc}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${availability === opt.value ? 'border-indigo-400' : 'border-gray-600'}`}>
                    {availability === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="report-comment" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Comment <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <textarea
              id="report-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g. Queue is about 20 vehicles long, moving fast..."
              rows={2}
              maxLength={200}
              className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 resize-none transition"
            />
            <p className="text-[10px] text-gray-600 text-right mt-1">{comment.length}/200</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 text-sm text-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              id="submit-report-btn"
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
