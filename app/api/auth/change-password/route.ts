import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const user = await prisma.User.findUnique({ where: { id: session.uid } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
  return NextResponse.json({ ok: true });
}
