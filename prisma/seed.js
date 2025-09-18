// Simple seed script for demo data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

function monthLabel(indexFromStart) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - (11 - indexFromStart), 1);
  return d.toLocaleDateString('en-US', { month: 'short' });
}

async function main() {
  // Clear existing
  await prisma.seriesPoint.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // KPIs
  await prisma.kpi.create({
    data: {
      revenue: 128400,
      orders: 2450,
      customers: 980,
      refunds: 27,
    },
  });

  // Time series (12 months)
  const points = Array.from({ length: 12 }, (_, idx) => ({
    label: monthLabel(idx),
    value: Math.round(80 + Math.sin(idx) * 20 + idx * 3),
    idx,
  }));
  await prisma.seriesPoint.createMany({ data: points });

  // Demo user
  const password = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin', password },
  });

  const org = await prisma.organization.create({ data: { name: 'Acme Inc.' } });
  await prisma.membership.create({ data: { userId: admin.id, orgId: org.id, role: 'owner' } });

  // Contacts
  const names = ['Alice', 'Bob', 'Carol', 'Dan', 'Eve', 'Frank', 'Grace', 'Heidi'];
  const statuses = ['Active', 'Invited', 'Suspended'];
  const rows = Array.from({ length: 25 }).map((_, i) => {
    const name = names[i % names.length];
    const email = `${name.toLowerCase()}${i}@example.com`;
    const status = statuses[i % statuses.length];
    return { name, email, status, createdById: admin.id, orgId: org.id };
  });
  await prisma.contact.createMany({ data: rows });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
