import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../generated';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.module.deleteMany();
  await prisma.mission.deleteMany();

  // Mission 0
  const m0 = await prisma.mission.create({
    data: {
      title: 'Mission 0: Welcome to next level web development',
      position: 0,
      modules: {
        create: [
          { name: 'Module 0: Welcome',      done: true, position: 0 },
          { name: 'Module 0.5: Orientation', done: true, position: 1 },
        ],
      },
    },
  });

  // Mission 01
  const m1 = await prisma.mission.create({
    data: {
      title: 'Mission 01: Be A Typescript Technocrat',
      position: 1,
      modules: {
        create: [
          { name: 'Module 1: Explore Basic Types of Typescript',   done: false, position: 0 },
          { name: 'Module 2: Explore advance types of typescript',  done: false, position: 1 },
          { name: 'Module 3: Object Oriented Typescript',           done: false, position: 2 },
        ],
      },
    },
  });

  console.log(`✅ Created missions: "${m0.title}", "${m1.title}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
