import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import events from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  label: z.string().min(1),
  value: z.number().int(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const last = await prisma.seriesPoint.findFirst({ orderBy: { idx: 'desc' } });
  const created = await prisma.seriesPoint.create({
    data: { label: parsed.data.label, value: parsed.data.value, idx: (last?.idx ?? -1) + 1 },
  });
  events.emit('message', { type: 'series:created', data: created });
  return NextResponse.json(created, { status: 201 });
}
