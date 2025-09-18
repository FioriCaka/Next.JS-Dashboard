'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddContactForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch('/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, status }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Failed to add');
      return;
    }
    setName('');
    setEmail('');
    setStatus('Active');
    // Revalidate and refresh server-rendered data
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
      <input
        placeholder="Name"
        className="input w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        className="input w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Active</option>
        <option>Invited</option>
        <option>Suspended</option>
      </select>
      <button className="btn-primary" disabled={loading}>
        {loading ? 'Adding…' : 'Add Contact'}
      </button>
      {err && <div className="col-span-full text-sm text-red-600">{err}</div>}
    </form>
  );
}
