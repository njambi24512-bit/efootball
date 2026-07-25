import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CirclePlus, Clock3, Trophy } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

type TournamentStatus = 'draft' | 'open' | 'closed';

type Tournament = {
  id: string;
  name: string;
  format: string;
  maxParticipants: number;
  startDate: string;
  status: TournamentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
};

type TournamentMetrics = {
  total: number;
  open: number;
  draft: number;
  closed: number;
  upcoming: number;
  lastUpdatedAt: string | null;
};

type TournamentFormState = {
  name: string;
  format: string;
  maxParticipants: string;
  startDate: string;
  status: TournamentStatus;
};

const emptyForm: TournamentFormState = {
  name: '',
  format: 'single-elimination',
  maxParticipants: '16',
  startDate: '',
  status: 'draft'
};

const statusStyles: Record<TournamentStatus, string> = {
  draft: 'border-slate-card/30 bg-slate-card/10 text-slate-card',
  open: 'border-turf/40 bg-turf/10 text-turf',
  closed: 'border-card/40 bg-card/10 text-card'
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [metrics, setMetrics] = useState<TournamentMetrics>({
    total: 0,
    open: 0,
    draft: 0,
    closed: 0,
    upcoming: 0,
    lastUpdatedAt: null
  });
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<TournamentFormState>(emptyForm);
  const [editForm, setEditForm] = useState<TournamentFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournamentId) || null,
    [selectedTournamentId, tournaments]
  );

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const [tournamentsResponse, metricsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tournaments`),
        fetch(`${API_BASE_URL}/api/tournaments/metrics`)
      ]);

      const tournamentsData = await tournamentsResponse.json();
      const metricsData = await metricsResponse.json();

      const nextTournaments: Tournament[] = Array.isArray(tournamentsData.tournaments) ? tournamentsData.tournaments : [];
      setTournaments(nextTournaments);
      setMetrics(metricsData.metrics || metrics);

      if (!selectedTournamentId && nextTournaments[0]) {
        setSelectedTournamentId(nextTournaments[0].id);
        setEditForm({
          name: nextTournaments[0].name,
          format: nextTournaments[0].format,
          maxParticipants: String(nextTournaments[0].maxParticipants),
          startDate: nextTournaments[0].startDate,
          status: nextTournaments[0].status
        });
      }
    } catch {
      setError('Failed to load tournaments from the backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      setEditForm({
        name: selectedTournament.name,
        format: selectedTournament.format,
        maxParticipants: String(selectedTournament.maxParticipants),
        startDate: selectedTournament.startDate,
        status: selectedTournament.status
      });
    }
  }, [selectedTournamentId, selectedTournament]);

  async function createTournament() {
    setSaving(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          format: createForm.format,
          max_participants: Number(createForm.maxParticipants),
          start_date: createForm.startDate
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to create tournament');
      }

      setCreateForm(emptyForm);
      setStatusMessage('Tournament saved to the backend.');
      await loadDashboard();
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to create tournament.');
    } finally {
      setSaving(false);
    }
  }

  async function updateTournament() {
    if (!selectedTournament) {
      return;
    }

    setSaving(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments/${selectedTournament.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          format: editForm.format,
          max_participants: Number(editForm.maxParticipants),
          start_date: editForm.startDate,
          status: editForm.status
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to update tournament');
      }

      setStatusMessage('Tournament updated and monitoring view refreshed.');
      await loadDashboard();
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to update tournament.');
    } finally {
      setSaving(false);
    }
  }

  function selectTournament(tournament: Tournament) {
    setSelectedTournamentId(tournament.id);
    setEditForm({
      name: tournament.name,
      format: tournament.format,
      maxParticipants: String(tournament.maxParticipants),
      startDate: tournament.startDate,
      status: tournament.status
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border border-pitch-lighter bg-gradient-to-br from-pitch-light via-pitch-light to-pitch p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-turf">
              <Trophy size={14} />
              Tournament control center
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-wide text-chalk sm:text-5xl">Create, monitor, and update tournaments</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-card sm:text-base">
              Use this dashboard to save tournaments to the backend, inspect their current status, and update each one from a single place.
              The data here is read and written through the live API, so the page reflects what is actually stored.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'Total', value: metrics.total },
              { label: 'Open', value: metrics.open },
              { label: 'Draft', value: metrics.draft },
              { label: 'Closed', value: metrics.closed },
              { label: 'Upcoming', value: metrics.upcoming }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-pitch-lighter bg-pitch/70 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-card">{item.label}</p>
                <p className="mt-1 font-display text-3xl tracking-wide text-chalk">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-pitch-lighter bg-pitch-light p-6">
          <div className="flex items-center gap-2">
            <CirclePlus size={18} className="text-turf" />
            <h2 className="font-display text-2xl tracking-wide text-chalk">Create tournament</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-card">Tournament name</span>
              <input
                value={createForm.name}
                onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
                className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition placeholder:text-slate-card/60 focus:border-turf"
                placeholder="Weekend Cup"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-card">Format</span>
              <select
                value={createForm.format}
                onChange={(event) => setCreateForm({ ...createForm, format: event.target.value })}
                className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-turf"
              >
                <option value="single-elimination">Single elimination</option>
                <option value="double-elimination">Double elimination</option>
                <option value="round-robin">Round robin</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-card">Max participants</span>
              <input
                type="number"
                min="2"
                value={createForm.maxParticipants}
                onChange={(event) => setCreateForm({ ...createForm, maxParticipants: event.target.value })}
                className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-turf"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-card">Start date</span>
              <input
                type="date"
                value={createForm.startDate}
                onChange={(event) => setCreateForm({ ...createForm, startDate: event.target.value })}
                className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-turf"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-card">Initial status</span>
              <select
                value={createForm.status}
                onChange={(event) => setCreateForm({ ...createForm, status: event.target.value as TournamentStatus })}
                className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-turf"
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>

          <button
            onClick={createTournament}
            disabled={saving || !createForm.name || !createForm.startDate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-floodlight px-5 py-3 font-semibold text-pitch transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save tournament
          </button>

          {statusMessage && <p className="mt-4 text-sm text-turf">{statusMessage}</p>}
          {error && <p className="mt-4 text-sm text-card">{error}</p>}

          <div className="mt-8 flex items-center justify-between border-t border-pitch-lighter pt-5">
            <div>
              <h3 className="font-display text-xl tracking-wide text-chalk">Saved tournaments</h3>
              <p className="mt-1 text-sm text-slate-card">Click one to inspect and update it.</p>
            </div>
            <button onClick={loadDashboard} className="rounded-lg border border-pitch-lighter px-4 py-2 text-sm font-semibold text-chalk transition hover:border-turf">
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="rounded-xl border border-pitch-lighter bg-pitch px-4 py-4 text-sm text-slate-card">Loading tournaments...</div>
            ) : tournaments.length === 0 ? (
              <div className="rounded-xl border border-pitch-lighter bg-pitch px-4 py-4 text-sm text-slate-card">
                No tournaments yet. Create one above and it will be stored in the backend.
              </div>
            ) : (
              tournaments.map((tournament) => {
                const isActive = tournament.id === selectedTournamentId;

                return (
                  <button
                    key={tournament.id}
                    onClick={() => selectTournament(tournament)}
                    className={`rounded-2xl border p-4 text-left transition ${isActive ? 'border-turf bg-turf/10' : 'border-pitch-lighter bg-pitch hover:border-turf/60'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[tournament.status]}`}>
                            {tournament.status}
                          </span>
                          {isActive && <span className="text-xs text-turf">selected</span>}
                        </div>
                        <h4 className="mt-3 font-display text-2xl tracking-wide text-chalk">{tournament.name}</h4>
                        <p className="mt-2 text-sm text-slate-card">Format: {tournament.format}</p>
                        <p className="mt-1 text-sm text-slate-card">Starts: {new Date(tournament.startDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-card">
                        <span className="inline-flex items-center gap-1 rounded-full border border-pitch-lighter px-3 py-1">
                          <Clock3 size={12} />
                          Updated {new Date(tournament.updatedAt || tournament.createdAt).toLocaleString()}
                        </span>
                        <span>{tournament.maxParticipants} slots</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pitch-lighter bg-pitch-light p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-floodlight" />
            <h2 className="font-display text-2xl tracking-wide text-chalk">Monitor and update</h2>
          </div>

          {selectedTournament ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-pitch-lighter bg-pitch px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-card">Live record</p>
                <h3 className="mt-2 font-display text-3xl tracking-wide text-chalk">{selectedTournament.name}</h3>
                <p className="mt-2 text-sm text-slate-card">Use the controls below to monitor the tournament and persist updates to the backend.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-pitch-lighter bg-pitch-light px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-card">Created by</p>
                    <p className="mt-1 text-sm text-chalk">{selectedTournament.createdBy}</p>
                  </div>
                  <div className="rounded-xl border border-pitch-lighter bg-pitch-light px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-card">Last updated</p>
                    <p className="mt-1 text-sm text-chalk">{new Date(selectedTournament.updatedAt || selectedTournament.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-card">Tournament name</span>
                  <input
                    value={editForm.name}
                    onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                    className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-floodlight"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-card">Format</span>
                  <select
                    value={editForm.format}
                    onChange={(event) => setEditForm({ ...editForm, format: event.target.value })}
                    className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-floodlight"
                  >
                    <option value="single-elimination">Single elimination</option>
                    <option value="double-elimination">Double elimination</option>
                    <option value="round-robin">Round robin</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-card">Status</span>
                  <select
                    value={editForm.status}
                    onChange={(event) => setEditForm({ ...editForm, status: event.target.value as TournamentStatus })}
                    className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-floodlight"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-card">Max participants</span>
                  <input
                    type="number"
                    min="2"
                    value={editForm.maxParticipants}
                    onChange={(event) => setEditForm({ ...editForm, maxParticipants: event.target.value })}
                    className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-floodlight"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-card">Start date</span>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(event) => setEditForm({ ...editForm, startDate: event.target.value })}
                    className="w-full rounded-xl border border-pitch-lighter bg-pitch px-4 py-3 text-chalk outline-none transition focus:border-floodlight"
                  />
                </label>
              </div>

              <button
                onClick={updateTournament}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-turf px-5 py-3 font-semibold text-chalk transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Update selected tournament
              </button>

              <div className="rounded-2xl border border-pitch-lighter bg-pitch px-5 py-4 text-sm text-slate-card">
                <p className="font-semibold text-chalk">Monitoring notes</p>
                <ul className="mt-3 space-y-2 leading-6">
                  <li>• Fetch the selected record directly from the backend to inspect current state.</li>
                  <li>• Changes saved here persist through the API and update the list immediately after refresh.</li>
                  <li>• Status changes are reflected in the metrics cards at the top of the page.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-pitch-lighter bg-pitch px-5 py-6 text-sm text-slate-card">
              Select a tournament from the list to monitor it and edit its status.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
