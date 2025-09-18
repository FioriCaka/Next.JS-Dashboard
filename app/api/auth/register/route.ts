import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hash } });
  await createSession({ uid: user.id, email: user.email, name: user.name });
  return NextResponse.json({ ok: true });
}
