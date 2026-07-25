import React from 'react';

type Props = {
  id: string;
  username: string;
  text: string;
  createdAt: string;
  mine?: boolean;
};

export default function MessageItem({ username, text, createdAt, mine }: Props) {
  return (
    <div className={`flex items-start gap-3 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && (
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-turf to-floodlight text-sm font-bold text-white flex items-center justify-center shadow-md">
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
      )}

      <div className={`max-w-[78%] ${mine ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-slate-100">{username}</div>
          <div className="text-xs text-slate-400">{new Date(createdAt).toLocaleTimeString()}</div>
        </div>
        <div className={`mt-1 inline-block rounded-2xl px-4 py-2 ${mine ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white' : 'bg-[#0f1720] text-slate-100'} shadow-sm`}> 
          <div className="text-sm leading-snug whitespace-pre-wrap break-words">{text}</div>
        </div>
      </div>
    </div>
  );
}
