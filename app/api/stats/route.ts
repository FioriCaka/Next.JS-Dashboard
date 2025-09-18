import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const [kpi] = await prisma.kpi.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
  const points = await prisma.seriesPoint.findMany({ orderBy: { idx: 'asc' } });
  const kpis = kpi || { revenue: 0, orders: 0, customers: 0, refunds: 0 };
  const timeseries = points.map((p: { label: string; value: number }) => ({
    label: p.label,
    value: p.value,
  }));
  return NextResponse.json({ kpis, timeseries }, { headers: { 'Cache-Control': 'no-store' } });
}
