import React from 'react';

const members = [
  { id: 'u1', name: 'Matchday', role: 'Owner' },
  { id: 'u2', name: 'Alice', role: 'Moderator' },
  { id: 'u3', name: 'Bob', role: 'Member' },
  { id: 'u4', name: 'Charlie', role: 'Member' }
];

export default function MembersPanel() {
  const grouped: Record<string, typeof members> = { Owner: [], Moderator: [], Member: [] };
  members.forEach((m) => grouped[m.role as keyof typeof grouped].push(m));

  return (
    <aside className="w-64 bg-[#06070a] border-l border-[#0b0d10] p-4">
      <div className="text-sm font-semibold text-slate-100 mb-3">Online — 24</div>
      {Object.entries(grouped).map(([role, list]) => (
        <div key={role} className="mb-4">
          <div className="text-xs text-slate-500 uppercase mb-2">{role}</div>
          <div className="flex flex-col gap-2">
            {list.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm text-slate-100">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-turf to-floodlight flex items-center justify-center text-black font-bold">{m.name.charAt(0)}</div>
                <div>{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
