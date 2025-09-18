import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import events from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bulkSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  action: z.enum(['delete', 'status']),
  status: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { ids, action, status } = parsed.data;

  if (action === 'delete') {
    const deleted = await prisma.contact.deleteMany({ where: { id: { in: ids } } });
    await prisma.auditLog.create({
      data: {
        entity: 'Contact',
        entityId: 0,
        action: 'BULK_DELETE',
        actorId: session.uid,
        data: JSON.stringify({ ids }),
      },
    });
    events.emit('message', { type: 'contacts:deleted', ids });
    return NextResponse.json({ count: deleted.count });
  }

  if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });
  const updated = await prisma.contact.updateMany({ where: { id: { in: ids } }, data: { status } });
  await prisma.auditLog.create({
    data: {
      entity: 'Contact',
      entityId: 0,
      action: 'BULK_STATUS',
      actorId: session.uid,
      data: JSON.stringify({ ids, status }),
    },
  });
  events.emit('message', { type: 'contacts:status', ids, status });
  return NextResponse.json({ count: updated.count });
}
