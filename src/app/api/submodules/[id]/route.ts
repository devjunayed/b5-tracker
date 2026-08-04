import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Submodule id is required" },
        { status: 400 },
      );
    }

    await prisma.submodule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/submodules/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete submodule" },
      { status: 500 },
    );
  }
}
