export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
        <h1 className="font-display text-3xl tracking-wide">Marketplace</h1>
        <div className="mt-4 rounded-lg border border-floodlight/40 bg-floodlight/10 p-4 text-sm text-floodlight">
          Trading accounts may violate Konami terms of service. Users assume that risk.
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-5">
          <h2 className="font-display text-2xl tracking-wide">Premium account</h2>
          <p className="mt-2 text-sm text-slate-card">Verified sellers only. Escrow and dispute flow placeholder.</p>
        </div>
        <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-5">
          <h2 className="font-display text-2xl tracking-wide">Starter account</h2>
          <p className="mt-2 text-sm text-slate-card">Marketplace listing scaffolding for early testing.</p>
        </div>
      </div>
    </div>
  );
}
