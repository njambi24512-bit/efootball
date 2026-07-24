type Accent = 'turf' | 'floodlight' | 'card' | 'slate';

const accents: Record<Accent, { border: string; stat: string; label: string }> = {
  turf: { border: 'border-t-turf', stat: 'bg-turf text-pitch', label: 'text-turf' },
  floodlight: { border: 'border-t-floodlight', stat: 'bg-floodlight text-pitch', label: 'text-floodlight' },
  card: { border: 'border-t-card', stat: 'bg-card text-chalk', label: 'text-card' },
  slate: { border: 'border-t-slate-card', stat: 'bg-slate-card text-pitch', label: 'text-slate-card' }
};

export default function SquadCard({
  accent = 'turf',
  eyebrow,
  stat,
  title,
  children,
  footer,
  onClick
}: {
  accent?: Accent;
  eyebrow?: string;
  stat?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  const a = accents[accent] ?? accents.turf;
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      onClick={onClick}
      className={`w-full text-left bg-pitch-light border border-pitch-lighter border-t-4 ${a.border} rounded-lg p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:border-t-4 focus-visible:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <span className={`block text-[11px] font-bold uppercase tracking-wider2 ${a.label} mb-1`}>{eyebrow}</span>}
          <h3 className="font-display text-xl tracking-wide leading-tight">{title}</h3>
        </div>
        {stat !== undefined && (
          <span className={`font-mono text-sm font-bold rounded px-2 py-1 shrink-0 ${a.stat}`}>{stat}</span>
        )}
      </div>

      {children && <div className="text-sm text-slate-card leading-relaxed">{children}</div>}

      {footer && <div className="pt-2 border-t border-pitch-lighter text-xs text-slate-card">{footer}</div>}
    </Comp>
  );
}
