'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Kpis = { revenue: number; orders: number; customers: number; refunds?: number };

export default function UpdateKpiForm({ initial }: { initial: Kpis }) {
  const router = useRouter();
  const [form, setForm] = useState<Kpis>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const res = await fetch('/api/stats/kpi', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setErr('Failed to update KPIs');
      return;
    }
    router.refresh();
  }

  function numberInput<K extends keyof Kpis>(key: K, label: string) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-600">{label}</span>
        <input
          className="input"
          type="number"
          value={Number(form[key] ?? 0)}
          onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
        />
      </label>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
      {numberInput('revenue', 'Revenue')}
      {numberInput('orders', 'Orders')}
      {numberInput('customers', 'Customers')}
      {numberInput('refunds', 'Refunds')}
      <div className="flex items-end">
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Update KPIs'}
        </button>
      </div>
      {err && <div className="col-span-full text-sm text-red-600">{err}</div>}
    </form>
  );
}
