import React from 'react';
import { ChevronDown } from './icons';

const channels = [
  { id: 'c1', name: 'general', type: 'text' },
  { id: 'c2', name: 'announcements', type: 'text' },
  { id: 'c3', name: 'trading', type: 'text' },
  { id: 'c4', name: 'voice-1', type: 'voice' }
];

function ChannelItem({ channel }: { channel: { id: string; name: string; type: string } }) {
  return (
    <div className="px-3 py-1.5 rounded-md hover:bg-[#071018] cursor-pointer flex items-center gap-2 text-sm text-slate-300">
      <span className="text-slate-400">{channel.type === 'text' ? '#' : '🔊'}</span>
      <span className="truncate">{channel.name}</span>
    </div>
  );
}

export default function ChannelsSidebar() {
  return (
    <div className="w-56 bg-[#071018] border-r border-[#0b0d10] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-slate-100">Matchday</div>
        <button className="text-slate-400"><ChevronDown /></button>
      </div>

      <div className="mb-3 text-xs text-slate-500 uppercase tracking-wide">Text Channels</div>
      <div className="flex flex-col gap-1">
        {channels.filter((c) => c.type === 'text').map((c) => (
          <ChannelItem key={c.id} channel={c} />
        ))}
      </div>

      <div className="mt-4 mb-2 text-xs text-slate-500 uppercase tracking-wide">Voice Channels</div>
      <div className="flex flex-col gap-1">
        {channels.filter((c) => c.type === 'voice').map((c) => (
          <ChannelItem key={c.id} channel={c} />
        ))}
      </div>
    </div>
  );
}
