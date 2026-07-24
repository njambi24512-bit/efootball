import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">eFootball Community</h1>
          <p className="mt-2 text-slate-600">
            A starter community experience with chat, verification, tournaments, and marketplace flows.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/verify" className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-medium">Konami Verification</h2>
            <p className="mt-1 text-sm text-slate-600">Start the proof-of-ownership workflow.</p>
          </Link>
          <Link href="/profile" className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-medium">Profile</h2>
            <p className="mt-1 text-sm text-slate-600">Manage your platform profile.</p>
          </Link>
          <Link href="/marketplace" className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-medium">Marketplace</h2>
            <p className="mt-1 text-sm text-slate-600">Browse listings with ToS warnings.</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
