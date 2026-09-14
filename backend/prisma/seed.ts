import { PrismaClient, NumberType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const counters = [{ type: NumberType.normal }, { type: NumberType.priority }];

async function main() {
  for (const counter of counters) {
    await prisma.queueCounters.upsert({
      where: {
        type: counter.type,
      },
      update: {},
      create: {
        type: counter.type,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
