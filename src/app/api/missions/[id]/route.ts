import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
  const { timeMinutes } = await req.json();
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

  const { name, durationMinutes } = await req.json();
  const parsedDuration = Number(durationMinutes ?? 0);

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
      durationMinutes: parsedDuration,
      missionId,
      position: count,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
