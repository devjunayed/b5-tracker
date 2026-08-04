import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const moduleId = Number(rawId);
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const link = typeof body.link === "string" ? body.link.trim() : "";
    const durationMinutes = Number(body.durationMinutes ?? 0);

    if (!name) {
      return NextResponse.json(
        { error: "Submodule name is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 0) {
      return NextResponse.json(
        { error: "Duration must be a non-negative number of minutes" },
        { status: 400 },
      );
    }

    const count = await prisma.submodule.count({ where: { moduleId } });
    const submodule = await prisma.submodule.create({
      data: {
        moduleId,
        name,
        link: link || null,
        durationMinutes,
        position: count,
      },
    });

    return NextResponse.json(submodule, { status: 201 });
  } catch (error) {
    console.error("[POST /api/modules/:id/submodules]", error);
    return NextResponse.json(
      { error: "Failed to create submodule" },
      { status: 500 },
    );
  }
}
