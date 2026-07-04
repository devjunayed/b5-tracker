import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const kind = req.nextUrl.searchParams.get("kind");

  if (kind === "course") {
    await prisma.course.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  }

  await prisma.mission.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  if (body.kind === "reset-course") {
    const courseId = Number(id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.module.updateMany({
      where: { mission: { courseId } },
      data: { done: false },
    });

    const updated = await prisma.course.findUniqueOrThrow({
      where: { id: courseId },
      include: {
        missions: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
          include: {
            modules: { orderBy: [{ position: "asc" }, { id: "asc" }] },
          },
        },
      },
    });

    return NextResponse.json(updated);
  }

  const { timeMinutes } = body;
  const parsedTime = Number(timeMinutes);

  if (!Number.isInteger(parsedTime) || parsedTime < 0) {
    return NextResponse.json(
      { error: "Time must be a non-negative number of minutes" },
      { status: 400 }
    );
  }

  const mission = await prisma.mission.update({
    where: { id: Number(id) },
    data: { timeMinutes: parsedTime },
    include: { modules: { orderBy: [{ position: "asc" }, { id: "asc" }] } },
  });

  return NextResponse.json(mission);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const missionId = Number(id);

  const { name, durationMinutes, link } = await req.json();
  const parsedDuration = Number(durationMinutes ?? 0);
  const trimmedLink = typeof link === "string" ? link.trim() : "";

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(parsedDuration) || parsedDuration < 0) {
    return NextResponse.json(
      { error: "Duration must be a non-negative number of minutes" },
      { status: 400 }
    );
  }

  const count = await prisma.module.count({
    where: { missionId },
  });

  const module = await prisma.module.create({
    data: {
      name: name.trim(),
      link: trimmedLink || null,
      durationMinutes: parsedDuration,
      missionId,
      position: count,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
