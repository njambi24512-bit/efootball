import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageSquare, Newspaper, ShieldCheck, ShoppingBag, Trophy } from 'lucide-react';
import SquadCard from '../components/SquadCard';
import { API_BASE_URL } from '../lib/api';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news`).then((response) => response.json()).then((data) => setNews(data.items));
    fetch(`${API_BASE_URL}/api/tournaments`).then((response) => response.json()).then((data) => setTournaments(data.tournaments));
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-8 pt-4 md:grid-cols-5">
        <div className="flex flex-col gap-5 md:col-span-3">
          <span className="text-xs font-bold uppercase tracking-wider2 text-floodlight">Kickoff · 24 online worldwide</span>
          <h1 className="font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl">
            Your squad.
            <br />
            Your <span className="text-turf">community.</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-card">
            Verify your Konami ID, join a tournament tonight, trade accounts with people who&apos;ve actually been checked out, and never miss a pack drop again.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/verify" className="rounded bg-floodlight px-5 py-3 text-sm font-bold uppercase tracking-wider2 text-pitch transition hover:brightness-110">
              Verify your Konami ID
            </Link>
            <Link href="/tournaments" className="rounded border border-pitch-lighter px-5 py-3 text-sm font-bold uppercase tracking-wider2 text-chalk transition hover:border-turf">
              Browse tournaments
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-5 font-mono md:col-span-2">
          <div className="mb-3 text-[11px] uppercase tracking-wider2 text-slate-card">Right now</div>
          <div className="flex flex-col divide-y divide-pitch-lighter">
            <div className="flex justify-between py-2.5"><span className="text-sm">Global chat</span><span className="font-bold text-turf">24</span></div>
            <div className="flex justify-between py-2.5"><span className="text-sm">Regional chat</span><span className="font-bold text-turf">11</span></div>
            <div className="flex justify-between py-2.5"><span className="text-sm">Live tournaments</span><span className="font-bold text-floodlight">{tournaments.length}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-sm">Active listings</span><span className="font-bold text-floodlight">{news.length}</span></div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-wide">The pitch, laid out</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SquadCard accent="turf" eyebrow="Community" stat={<MessageSquare size={16} />} title="Chat">
            Global and regional rooms, live squad talk, tournament lobbies.
          </SquadCard>
          <SquadCard accent="floodlight" eyebrow="Compete" stat={<Trophy size={16} />} title="Tournaments">
            Single elim, double elim, round robin — host or join in minutes.
          </SquadCard>
          <SquadCard accent="card" eyebrow="Trade" stat={<ShoppingBag size={16} />} title="Marketplace">
            Buy and sell accounts, verified sellers only, escrow-backed.
          </SquadCard>
          <SquadCard accent="slate" eyebrow="Trust" stat={<ShieldCheck size={16} />} title="Verification">
            Prove you own your squad and lock your Konami ID to your account.
          </SquadCard>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">Latest from Konami</h2>
          <Link href="/news" className="text-xs font-bold uppercase tracking-wider2 text-turf hover:underline">All news</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.slice(0, 3).map((item) => (
            <SquadCard key={item.id} accent="slate" eyebrow={item.category || 'News'} stat={<Newspaper size={16} />} title={item.title} footer={item.sourceUrl || 'Konami'}>
              {item.summary}
            </SquadCard>
          ))}
        </div>
      </section>
    </div>
  );
}
