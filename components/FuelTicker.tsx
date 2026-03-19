'use client';

const tickerItems = [
  { label: '🔴 OUT OF STOCK', message: 'Jaffna CPC — 92 Octane unavailable. Queue expected.', severity: 'unavailable' },
  { label: '⚡ PRICE UPDATE', message: 'CPC 92 Octane: LKR 317/L | CPC Diesel: LKR 273/L | Lanka IOC 95: LKR 377/L', severity: 'info' },
  { label: '🟡 LIMITED', message: 'Kandy Peradeniya — All fuel types running critically low. Visit off-peak.', severity: 'limited' },
  { label: '🟢 AVAILABLE', message: 'Ratnapura CPC — All fuel types fully stocked as of 07:10 AM.', severity: 'available' },
  { label: '🔴 OUT OF STOCK', message: 'Vavuniya CPC — All fuel types unavailable. Resupply expected 20 March.', severity: 'unavailable' },
  { label: '⚠️ ADVISORY', message: 'Anuradhapura zone — Fuel shortage reported across multiple stations. Plan alternate routes.', severity: 'limited' },
  { label: '🟢 AVAILABLE', message: 'Colombo 3 Lanka IOC — All 4 fuel types available. Short queue.', severity: 'available' },
];

const severityColor: Record<string, string> = {
  available: 'text-emerald-400',
  limited: 'text-yellow-400',
  unavailable: 'text-red-400',
  info: 'text-sky-400',
};

const severityBg: Record<string, string> = {
  available: 'bg-emerald-500/20 border-emerald-500/30',
  limited: 'bg-yellow-500/20 border-yellow-500/30',
  unavailable: 'bg-red-500/20 border-red-500/30',
  info: 'bg-sky-500/20 border-sky-500/30',
};

export default function FuelTicker() {
  const content = tickerItems.map(item => (
    <span key={item.message} className="inline-flex items-center gap-3 mx-10">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBg[item.severity]} ${severityColor[item.severity]} uppercase tracking-wider`}>
        {item.label}
      </span>
      <span className="text-gray-300 text-xs">{item.message}</span>
    </span>
  ));

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-9 flex items-center overflow-hidden bg-gray-900/90 border-b border-gray-700/50 backdrop-blur-sm">
      {/* Label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 h-full bg-red-600/90 border-r border-red-500/50">
        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">⚠ FUEL ALERT</span>
      </div>
      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        <div className="ticker-animate flex items-center">
          {content}
          {content}
        </div>
      </div>
    </div>
  );
}
