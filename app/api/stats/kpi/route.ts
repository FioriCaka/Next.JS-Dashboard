import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import events from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  revenue: z.number().int().nonnegative().optional(),
  orders: z.number().int().nonnegative().optional(),
  customers: z.number().int().nonnegative().optional(),
  refunds: z.number().int().nonnegative().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'No changes' }, { status: 400 });

  const kpi = await prisma.kpi.findFirst();
  const updated = await prisma.kpi.update({ where: { id: kpi!.id }, data });

  events.emit('message', { type: 'kpi:updated', data: updated });
  return NextResponse.json(updated);
}
