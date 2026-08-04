import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    const existing = await prisma.submodule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Submodule not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.submodule.update({
      where: { id },
      data: { done: !existing.done },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/submodules/:id/toggle]", error);
    return NextResponse.json(
      { error: "Failed to toggle submodule" },
      { status: 500 },
    );
  }
}
