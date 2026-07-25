import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

type Tournament = {
  id: string;
  name: string;
  format: string;
  maxParticipants: number;
  startDate: string;
  status: string;
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tournaments`)
      .then((response) => response.json())
      .then((data) => setTournaments(Array.isArray(data.tournaments) ? data.tournaments : []))
      .catch(() => setTournaments([]));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
        <h1 className="font-display text-3xl tracking-wide">Tournaments</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-card">Live tournament data from the backend.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.length === 0 ? (
          <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-5 text-sm text-slate-card md:col-span-2">
            No tournaments yet. Create one through the API and it will show up here.
          </div>
        ) : (
          tournaments.map((tournament) => (
            <article key={tournament.id} className="rounded-lg border border-pitch-lighter bg-pitch-light p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider2 text-floodlight">
                <Trophy size={14} />
                {tournament.status}
              </div>
              <h2 className="mt-3 font-display text-2xl tracking-wide">{tournament.name}</h2>
              <p className="mt-2 text-sm text-slate-card">Format: {tournament.format}</p>
              <p className="mt-1 text-sm text-slate-card">Max participants: {tournament.maxParticipants}</p>
              <p className="mt-1 text-sm text-slate-card">Starts: {tournament.startDate}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
