import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import events from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [] as any[];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = {
    name: header.indexOf('name'),
    email: header.indexOf('email'),
    status: header.indexOf('status'),
  };
  const out: { name: string; email: string; status: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (!parts.length) continue;
    const name = (parts[idx.name] || '').replace(/^\"|\"$/g, '').trim();
    const email = (parts[idx.email] || '').trim();
    const status = (parts[idx.status] || 'Active').trim();
    if (!email) continue;
    out.push({ name, email, status });
  }
  return out;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('text/csv')) {
    return NextResponse.json({ error: 'Expected text/csv' }, { status: 400 });
  }
  const text = await req.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: 'No rows' }, { status: 400 });

  // Insert one-by-one to respect unique email and set creator
  let created = 0;
  for (const r of rows) {
    if (!r.email) continue;
    const exists = await prisma.contact.findUnique({ where: { email: r.email } });
    if (exists) continue;
    await prisma.contact.create({ data: { ...r, createdById: session.uid } });
    created++;
  }

  await prisma.auditLog.create({
    data: {
      entity: 'Contact',
      entityId: 0,
      action: 'IMPORT',
      actorId: session.uid,
      data: JSON.stringify({ created }),
    },
  });
  events.emit('message', { type: 'contacts:imported', count: created });
  return NextResponse.json({ created });
}
