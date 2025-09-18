import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export async function currentMembership(orgId: number) {
  const session = await requireSession();
  return prisma.membership.findFirst({ where: { userId: session.uid, orgId } });
}

export function hasRole(role: string, needed: Array<'owner' | 'admin' | 'editor' | 'viewer'>) {
  const order = ['viewer', 'editor', 'admin', 'owner'];
  return order.indexOf(role as any) >= Math.min(...needed.map((r) => order.indexOf(r)));
}
