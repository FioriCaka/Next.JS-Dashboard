import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, clearSession } from '@/lib/auth';
import { z } from 'zod';
import events from '@/lib/events';
import prismaClient from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('pageSize') || '10', 10) || 10)
  );
  const sort = (url.searchParams.get('sort') || 'id') as
    | 'id'
    | 'name'
    | 'email'
    | 'status'
    | 'createdAt'
    | 'updatedAt';
  const order = (url.searchParams.get('order') || 'asc') as 'asc' | 'desc';

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { status: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // If you add org scoping, derive orgId from session membership
  let orgFilter: any = {};
  try {
    const session = await getSession();
    if (session) {
      const member = await prismaClient.membership.findFirst({ where: { userId: session.uid } });
      if (member) orgFilter = { orgId: member.orgId };
    }
  } catch {
    /* no-op */
  }

  const total = await prisma.contact.count({ where: { ...where, ...orgFilter } });
  const rows = await prisma.contact.findMany({
    where: { ...where, ...orgFilter },
    orderBy: { [sort]: order },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { createdBy: { select: { id: true, email: true, name: true } } },
  });
  return NextResponse.json(
    { rows, total, page, pageSize },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      status: z.string().min(1),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { name, email, status } = parsed.data;
    const exists = await prisma.contact.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    // Ensure session user still exists to satisfy FK constraints
    const user = await prisma.user.findUnique({ where: { id: session.uid } });
    if (!user) {
      // Stale session cookie (DB reset or user deleted). Clear it and ask client to re-auth.
      clearSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const member = await prismaClient.membership.findFirst({ where: { userId: user.id } });
    // Build create data using relation connects (safer than unchecked scalar FKs)
    const createData: any = {
      name,
      email,
      status,
      createdBy: { connect: { id: user.id } },
    };
    if (member?.orgId) {
      createData.org = { connect: { id: member.orgId } };
    }
    let row;
    try {
      row = await prisma.contact.create({ data: createData });
    } catch (err: any) {
      // Handle common Prisma errors gracefully
      const code = err?.code;
      if (code === 'P2002') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Could not create contact' }, { status: 500 });
    }
    events.emit('message', { type: 'contacts:created', data: row });
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/table error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
