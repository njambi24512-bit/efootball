import { useState } from 'react';
import VerificationUploader from '../components/VerificationUploader';

export default function VerifyPage() {
  const [konamiId, setKonamiId] = useState('');
  const [platform, setPlatform] = useState('ps');
  const [result, setResult] = useState<any>(null);

  async function startVerification() {
    const response = await fetch('http://localhost:4000/api/konami/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ konami_id: konamiId, platform })
    });
    const data = await response.json();
    setResult(data);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <main className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Konami verification</h1>
        <p className="mt-2 text-slate-600">
          Submit proof of ownership and receive a moderator review.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Konami ID</span>
            <input
              value={konamiId}
              onChange={(event) => setKonamiId(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Platform</span>
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="ps">PlayStation</option>
              <option value="xbox">Xbox</option>
              <option value="pc">PC</option>
            </select>
          </label>

          <button
            onClick={startVerification}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Start verification
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="mt-8">
          <VerificationUploader verificationCode={result?.verification_code || 'EF-XXXX'} />
        </div>
      </main>
    </div>
  );
}
