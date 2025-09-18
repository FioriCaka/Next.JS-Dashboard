import Card from '@/components/Card';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });
import { getBaseUrl } from '@/lib/urls';
import UpdateKpiForm from './updateKpiForm';

async function getStats() {
  const url = new URL('/api/stats', getBaseUrl()).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export default async function Page() {
  const data = await getStats();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Revenue" value={`$${data.kpis.revenue.toLocaleString()}`} hint="MoM +8%" />
        <Card title="Orders" value={data.kpis.orders} hint="MoM +2%" />
        <Card title="Customers" value={data.kpis.customers} hint="MoM +5%" />
        <Card title="Refunds" value={data.kpis.refunds ?? 32} hint="MoM -1%" />
      </div>
      <Chart data={data.timeseries} />
      <UpdateKpiForm initial={data.kpis} />
    </div>
  );
}
