import { useState } from 'react';

export default function VerificationUploader({
  verificationCode
}: {
  verificationCode: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadProof() {
    if (!file) return;
    setUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUploading(false);
    alert(`Proof submitted for ${verificationCode}`);
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-600">Verification code</p>
      <p className="text-lg font-semibold">{verificationCode}</p>
      <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-3" />
      <button
        onClick={uploadProof}
        disabled={!file || uploading}
        className="mt-3 rounded bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {uploading ? 'Uploading...' : 'Upload proof'}
      </button>
    </div>
  );
}
