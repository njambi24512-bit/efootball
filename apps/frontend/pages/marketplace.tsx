export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <main className="mx-auto max-w-4xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Trading accounts may violate Konami terms of service. Users assume that risk.
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h2 className="font-medium">Premium account</h2>
            <p className="mt-2 text-sm text-slate-600">Verified sellers only. Escrow and dispute flow placeholder.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="font-medium">Starter account</h2>
            <p className="mt-2 text-sm text-slate-600">Marketplace listing scaffolding for early testing.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
