import React from 'react';

const servers = [
  { id: 's1', name: 'Matchday', color: 'from-turf to-floodlight' },
  { id: 's2', name: 'Community', color: 'from-floodlight to-turf' },
  { id: 's3', name: 'Events', color: 'from-slate-600 to-slate-800' }
];

export default function LeftServersBar() {
  return (
    <div className="w-16 flex flex-col items-center gap-3 py-4 bg-[#06070a] border-r border-[#0b0d10]">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-turf to-floodlight flex items-center justify-center text-black font-bold">M</div>
      <div className="flex flex-col gap-2 mt-2">
        {servers.map((s) => (
          <button
            key={s.id}
            title={s.name}
            className={`h-10 w-10 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-sm font-semibold text-black shadow-md hover:scale-105 transition-transform`}
          >
            {s.name.charAt(0)}
          </button>
        ))}
      </div>
      <div className="mt-auto pb-3">
        <button className="h-9 w-9 rounded-full border border-[#0f1720] bg-transparent text-slate-300">+</button>
      </div>
    </div>
  );
}
