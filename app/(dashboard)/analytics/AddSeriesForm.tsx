'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSeriesForm() {
  const router = useRouter();
  const [label, setLabel] = useState('New');
  const [value, setValue] = useState<number | ''>('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch('/api/stats/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, value: Number(value) }),
    });
    setLoading(false);
    if (!res.ok) {
      setErr('Failed to add point');
      return;
    }
    setLabel('New');
    setValue('');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
      <input
        className="input"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        className="input"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
        type="number"
      />
      <div />
      <button className="btn-primary" disabled={loading}>
        {loading ? 'Adding…' : 'Add Point'}
      </button>
      {err && <div className="col-span-full text-sm text-red-600">{err}</div>}
    </form>
  );
}
