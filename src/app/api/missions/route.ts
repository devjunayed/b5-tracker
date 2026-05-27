import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/missions
export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      include: {
        modules: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
      },
    });
    return NextResponse.json(missions);
  } catch (error) {
    console.log(error);
    console.error('[GET /api/missions]', error);
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

// POST /api/missions  — body: { title: string }
export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const count = await prisma.mission.count();
    const mission = await prisma.mission.create({
      data: { title: title.trim(), position: count, timeMinutes: 0 },
      include: { modules: true },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('[POST /api/missions]', error);
    return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
  }
}
