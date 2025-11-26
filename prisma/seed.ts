import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  // create a demo user
  const user = await prisma.user.upsert({ where: { email: 'demo@layout.agency' }, update: {}, create: { email: 'demo@layout.agency', name: 'Demo User' } });

  // create some sample activities for Companies
  await prisma.activityLog.createMany({ data: [
    { userId: user.id, date: new Date(), pipeline: 'COMPANIES', coldCallsMade: 50, coldCallsAnswered: 10, r1ViaCall: 6 },
    { userId: user.id, date: new Date(), pipeline: 'INFLUENCERS', coldCallsMade: 20, coldCallsAnswered: 4, r1ViaCall: 2 }
  ]});

  console.log('Seed complete');
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect());
