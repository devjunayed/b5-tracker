import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/modules/[id]/toggle
export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    const existing = await prisma.module.findUnique({
      where: { id },
      include: { submodules: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const nextDone =
      existing.submodules.length > 0
        ? existing.submodules.every((submodule) => submodule.done)
        : !existing.done;

    const updated = await prisma.module.update({
      where: { id },
      data: { done: nextDone },
      include: { submodules: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/modules/:id/toggle]", error);
    return NextResponse.json(
      { error: "Failed to toggle module" },
      { status: 500 },
    );
  }
}
