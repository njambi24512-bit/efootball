import { useEffect, useState } from 'react';
import VerificationUploader from '../components/VerificationUploader';
import { API_BASE_URL } from '../lib/api';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konamiId, setKonamiId] = useState('');
  const [platform, setPlatform] = useState('ps');
  const [region, setRegion] = useState('eu');
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = window.localStorage.getItem('efootball-token') || '';
      setToken(storedToken);
    }
  }, []);

  async function auth() {
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'register' ? { username, email, password, platform, region } : { email, password })
    });

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('efootball-token', data.token);
      }
      setStatus(`${mode === 'register' ? 'Registered' : 'Logged in'} successfully.`);
    } else {
      setStatus(data.error || 'Authentication failed');
    }
  }

  async function startVerification() {
    const response = await fetch(`${API_BASE_URL}/api/konami/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ konami_id: konamiId, platform })
    });
    const data = await response.json();
    setResult(data);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
        <h1 className="font-display text-3xl tracking-wide">Konami verification</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-card">Authenticate, create a verification code, and submit proof for moderator review.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
          <div className="flex gap-2">
            <button onClick={() => setMode('register')} className={`rounded px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-floodlight text-pitch' : 'bg-pitch-lighter text-chalk'}`}>
              Register
            </button>
            <button onClick={() => setMode('login')} className={`rounded px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-floodlight text-pitch' : 'bg-pitch-lighter text-chalk'}`}>
              Login
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {mode === 'register' && <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk" />}
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk" />
            {mode === 'register' && (
              <div className="grid gap-3 md:grid-cols-2">
                <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk">
                  <option value="ps">PlayStation</option>
                  <option value="xbox">Xbox</option>
                  <option value="pc">PC</option>
                </select>
                <select value={region} onChange={(event) => setRegion(event.target.value)} className="rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk">
                  <option value="eu">EU</option>
                  <option value="na">NA</option>
                  <option value="apac">APAC</option>
                </select>
              </div>
            )}
            <button onClick={auth} className="rounded bg-turf px-4 py-2 font-semibold text-chalk">{mode === 'register' ? 'Create account' : 'Sign in'}</button>
            {status && <p className="text-sm text-slate-card">{status}</p>}
          </div>
        </section>

        <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-card">Konami ID</span>
            <input value={konamiId} onChange={(event) => setKonamiId(event.target.value)} className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk" />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-card">Platform</span>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk">
              <option value="ps">PlayStation</option>
              <option value="xbox">Xbox</option>
              <option value="pc">PC</option>
            </select>
          </label>

          <button onClick={startVerification} className="mt-4 rounded bg-floodlight px-4 py-2 font-semibold text-pitch" disabled={!token}>Start verification</button>

          {result && <pre className="mt-4 overflow-x-auto rounded border border-pitch-lighter bg-pitch p-3 text-sm text-slate-card">{JSON.stringify(result, null, 2)}</pre>}

          <div className="mt-6"><VerificationUploader verificationCode={result?.verification_code || 'EF-XXXX'} /></div>
        </section>
      </div>
    </div>
  );
}
