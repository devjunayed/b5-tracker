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
  console.log('Seeding database...');

  await prisma.module.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.course.deleteMany();

  const course = await prisma.course.create({
    data: {
      title: 'Batch 5 Course',
      position: 0,
      missions: {
        create: [
          {
            title: 'Mission 0: Welcome to next level web development',
            position: 0,
            modules: {
              create: [
                { name: 'Module 0: Welcome', done: true, position: 0 },
                { name: 'Module 0.5: Orientation', done: true, position: 1 },
              ],
            },
          },
          {
            title: 'Mission 01: Be A Typescript Technocrat',
            position: 1,
            modules: {
              create: [
                { name: 'Module 1: Explore Basic Types of Typescript', done: false, position: 0 },
                { name: 'Module 2: Explore advance types of typescript', done: false, position: 1 },
                { name: 'Module 3: Object Oriented Typescript', done: false, position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created course: "${course.title}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
