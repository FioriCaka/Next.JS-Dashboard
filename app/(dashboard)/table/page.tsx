import ClientView from './ClientView';
import { getBaseUrl } from '@/lib/urls';

type Row = {
  id: number;
  name: string;
  email: string;
  status: string;
  createdBy?: { id: number; email: string; name?: string | null };
};

async function getRows(searchParams?: Record<string, string | string[] | undefined>) {
  const url = new URL('/api/table', getBaseUrl());
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, String(vv)));
      else url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch table');
  const data = await res.json();
  return data;
}

export default async function TablePage({ searchParams }: { searchParams?: Record<string, any> }) {
  const data = await getRows(searchParams);
  const rows: Row[] = Array.isArray(data) ? data : data.rows;
  const total = Array.isArray(data) ? rows.length : data.total;
  const page = Number(searchParams?.page || 1);
  const pageSize = Number(searchParams?.pageSize || 10);
  const q = String(searchParams?.q || '');
  const sort = String(searchParams?.sort || 'id');
  const order = String(searchParams?.order || 'asc');
  return (
    <ClientView
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      q={q}
      sort={sort}
      order={order as 'asc' | 'desc'}
    />
  );
}
