import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = window.localStorage.getItem('efootball-token') || '';
      setToken(storedToken);
      if (storedToken) {
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .then((response) => response.json())
          .then((data) => setUser(data.user));
      }
    }
  }, []);

  async function saveProfile() {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username: user.username, platform: user.platform, region: user.region })
    });
    const data = await response.json();
    setUser(data.user);
    setStatus('Profile updated');
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-8">
        <h1 className="font-display text-3xl tracking-wide">Profile</h1>
        <p className="mt-2 text-slate-card">Sign in from the verification page to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-8">
      <h1 className="font-display text-3xl tracking-wide">Profile</h1>
      <p className="mt-2 text-slate-card">Manage your platform profile and verification settings.</p>

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-card">Username</span>
          <input value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-card">Platform</span>
          <select value={user.platform} onChange={(event) => setUser({ ...user, platform: event.target.value })} className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk">
            <option value="ps">PlayStation</option>
            <option value="xbox">Xbox</option>
            <option value="pc">PC</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-card">Region</span>
          <select value={user.region} onChange={(event) => setUser({ ...user, region: event.target.value })} className="w-full rounded border border-pitch-lighter bg-pitch px-3 py-2 text-chalk">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="apac">APAC</option>
          </select>
        </label>
        <button onClick={saveProfile} className="rounded bg-turf px-4 py-2 font-semibold text-chalk">Save profile</button>
        {status && <p className="text-sm text-slate-card">{status}</p>}
      </div>
    </div>
  );
}
