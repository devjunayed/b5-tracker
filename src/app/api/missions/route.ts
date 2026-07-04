import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const courseInclude = {
  missions: {
    orderBy: [{ position: 'asc' as const }, { id: 'asc' as const }],
    include: {
      modules: { orderBy: [{ position: 'asc' as const }, { id: 'asc' as const }] },
    },
  },
};

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      include: courseInclude,
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('[GET /api/missions]', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.kind === 'course') {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const count = await prisma.course.count();
      const course = await prisma.course.create({
        data: { title: body.title.trim(), position: count },
        include: courseInclude,
      });

      return NextResponse.json(course, { status: 201 });
    }

    const parsedCourseId = Number(body.courseId);

    if (!Number.isInteger(parsedCourseId)) {
      return NextResponse.json({ error: 'Course is required' }, { status: 400 });
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const count = await prisma.mission.count({ where: { courseId: parsedCourseId } });
    const mission = await prisma.mission.create({
      data: {
        courseId: parsedCourseId,
        title: body.title.trim(),
        position: count,
        timeMinutes: 0,
      },
      include: { modules: true },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('[POST /api/missions]', error);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}
