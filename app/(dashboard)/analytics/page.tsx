import Card from '@/components/Card';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });
import { getBaseUrl } from '@/lib/urls';
import AddSeriesForm from './AddSeriesForm';

async function getStats() {
  const url = new URL('/api/stats', getBaseUrl()).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export default async function AnalyticsPage() {
  const data = await getStats();
  const avg = Math.round(
    data.timeseries.reduce((acc: number, p: any) => acc + p.value, 0) / data.timeseries.length
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Average" value={`$${avg.toLocaleString()}`} />
        <Card
          title="Max"
          value={`$${Math.max(...data.timeseries.map((d: any) => d.value)).toLocaleString()}`}
        />
        <Card
          title="Min"
          value={`$${Math.min(...data.timeseries.map((d: any) => d.value)).toLocaleString()}`}
        />
      </div>
      <Chart data={data.timeseries} />
      <AddSeriesForm />
    </div>
  );
}
