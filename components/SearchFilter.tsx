'use client';

import { useState, useEffect } from 'react';
import type { Station } from '@/types/station';

interface SearchFilterProps {
  stations: Station[];
  onFilterChange: (filtered: Station[]) => void;
}

import { DISTRICTS, DISTRICT_CITIES } from '@/lib/constants';

const ALL_CITIES = Object.values(DISTRICT_CITIES).flat().sort();
const FUEL_TYPES = ['all', '92 Octane', '95 Octane', 'Diesel', 'Super Diesel'];
const BRANDS = ['all', 'CPC', 'Lanka IOC', 'Sinopec'];
const STATUSES = ['all', 'available', 'limited', 'unavailable'];

const statusLabels: Record<string, string> = {
  all: 'All Status',
  available: '🟢 Available',
  limited: '🟡 Limited',
  unavailable: '🔴 Out of Stock',
};

export default function SearchFilter({ stations, onFilterChange }: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('all');
  const [city, setCity] = useState('all');
  const [fuel, setFuel] = useState('all');
  const [brand, setBrand] = useState('all');
  const [status, setStatus] = useState('all');

  const availableCities = district === 'all' ? ALL_CITIES : (DISTRICT_CITIES[district] || []);
  const cityOptions = ['all', ...availableCities];

  useEffect(() => {
    if (district !== 'all' && city !== 'all' && !DISTRICT_CITIES[district]?.includes(city)) {
      setCity('all');
    }
  }, [district, city]);

  useEffect(() => {
    let filtered = [...stations];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }
    if (district !== 'all') filtered = filtered.filter(s => s.district === district);
    if (city !== 'all') filtered = filtered.filter(s => s.city === city);
    if (brand !== 'all') filtered = filtered.filter(s => s.brand === brand);
    if (fuel !== 'all') filtered = filtered.filter(s => s.fuelTypes.some(f => f.type === fuel));
    if (status !== 'all') filtered = filtered.filter(s => s.fuelTypes.some(f => f.status === status));

    onFilterChange(filtered);
  }, [search, district, city, fuel, brand, status, stations]);

  const clearAll = () => {
    setSearch('');
    setDistrict('all');
    setCity('all');
    setFuel('all');
    setBrand('all');
    setStatus('all');
  };

  const hasFilters = search || district !== 'all' || city !== 'all' || fuel !== 'all' || brand !== 'all' || status !== 'all';

  return (
    <div className="flex flex-col gap-3 p-4 glass rounded-xl border border-gray-700/50">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="station-search"
          type="text"
          placeholder="Search station, city, brand..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 gap-2">
        <Select id="filter-district" value={district} onChange={setDistrict} options={['all', ...DISTRICTS]} placeholder="All Districts" />
        <Select id="filter-city" value={city} onChange={setCity} options={cityOptions} placeholder="All Cities" />
        <Select id="filter-brand" value={brand} onChange={setBrand} options={BRANDS} placeholder="All Brands" />
        <Select id="filter-fuel" value={fuel} onChange={setFuel} options={FUEL_TYPES} placeholder="All Fuel Types" />
        <select
          id="filter-status"
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition self-start"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}

function Select({ id, value, onChange, options, placeholder }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt === 'all' ? placeholder : opt}
        </option>
      ))}
    </select>
  );
}
