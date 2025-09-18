'use client';
import DataTable from '@/components/DataTable';
import AddContactForm from '@/components/AddContactForm';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Row = {
  id: number;
  name: string;
  email: string;
  status: string;
  createdBy?: { id: number; email: string; name?: string | null };
};

type DisplayRow = Row & { creator: string };

export default function ClientView({
  rows,
  total,
  page,
  pageSize,
  q,
  sort,
  order,
}: {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  sort: string;
  order: 'asc' | 'desc';
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const displayRows: DisplayRow[] = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        creator: r.createdBy ? r.createdBy.name || r.createdBy.email : '—',
      })),
    [rows]
  );

  useEffect(() => {
    const ev = new EventSource('/api/stream');
    ev.onmessage = () => router.refresh();
    return () => ev.close();
  }, [router]);

  const allSelected = selected.size > 0 && selected.size === rows.length;
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }
  function toggleOne(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    await fetch('/api/table/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: Array.from(selected) }),
    });
    setSelected(new Set());
    router.refresh();
  }

  async function bulkStatus(status: string) {
    if (selected.size === 0) return;
    await fetch('/api/table/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', status, ids: Array.from(selected) }),
    });
    setSelected(new Set());
    router.refresh();
  }

  async function onImportFile(f: File | null) {
    if (!f) return;
    setImporting(true);
    const text = await f.text();
    await fetch('/api/table/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: text,
    });
    setImporting(false);
    router.refresh();
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
      ),
      render: (row: any) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={() => toggleOne(row.id)}
          aria-label={`Select row ${row.id}`}
        />
      ),
    },
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'creator', header: 'Added By' },
  ] as any;

  function updateParam(newParams: Record<string, string | number>) {
    const u = new URL(window.location.href);
    Object.entries(newParams).forEach(([k, v]) => u.searchParams.set(k, String(v)));
    router.replace((u.pathname + '?' + u.searchParams.toString()) as any);
    router.refresh();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <AddContactForm />
        <div className="ml-auto flex items-center gap-2">
          <input
            className="input"
            placeholder="Search..."
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                updateParam({ q: (e.target as HTMLInputElement).value, page: 1 });
            }}
          />
          <button className="btn" onClick={bulkDelete} disabled={selected.size === 0}>
            Delete selected
          </button>
          <button
            className="btn"
            onClick={() => bulkStatus('Active')}
            disabled={selected.size === 0}
          >
            Mark Active
          </button>
          <button
            className="btn"
            onClick={() => bulkStatus('Suspended')}
            disabled={selected.size === 0}
          >
            Mark Suspended
          </button>
          <a className="btn" href="/api/table/export">
            Export CSV
          </a>
          <label className="btn">
            {importing ? 'Importing…' : 'Import CSV'}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onImportFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => updateParam({ page: page - 1 })}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages}
            onClick={() => updateParam({ page: page + 1 })}
          >
            Next
          </button>
          <select
            className="input"
            value={pageSize}
            onChange={(e) => updateParam({ pageSize: Number(e.target.value), page: 1 })}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
          <select
            className="input"
            value={sort}
            onChange={(e) => updateParam({ sort: e.target.value, page: 1 })}
          >
            {['id', 'name', 'email', 'status'].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={order}
            onChange={(e) => updateParam({ order: e.target.value, page: 1 })}
          >
            {['asc', 'desc'].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable<DisplayRow> columns={columns} rows={displayRows} />
    </div>
  );
}
