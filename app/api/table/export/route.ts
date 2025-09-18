import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await prisma.contact.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, status: true },
  });
  const header = 'id,name,email,status\n';
  const body = rows
    .map((r) => `${r.id},"${(r.name || '').replace(/"/g, '""')}",${r.email},${r.status}`)
    .join('\n');
  const csv = header + body + '\n';
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contacts.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
