'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-gray-700/50">
      <div className="max-w-full h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 22V7l6-5 6 5v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 10l-2-2V5h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">FuelWatch</span>
              <span className="text-gray-400 font-medium"> LK</span>
            </h1>
            <p className="text-[10px] text-gray-500 leading-none">Sri Lanka Fuel Tracker</p>
          </div>
        </div>

        {/* Center pills */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-live"></span>
            <span className="text-emerald-400 text-xs font-semibold">LIVE</span>
          </div>
          <span className="text-gray-500 text-xs">20 stations tracked</span>
        </div>

        {/* Right: Clock */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-mono font-semibold text-gray-200">{time}</p>
            <p className="text-[10px] text-gray-500">{date}</p>
          </div>
          {/* Mobile live dot */}
          <div className="md:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-live"></span>
            <span className="text-emerald-400 text-xs font-semibold">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
