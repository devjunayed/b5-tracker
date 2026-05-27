import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// DELETE /api/modules/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/modules/:id]', error);
    return NextResponse.json({ error: 'Module not found' }, { status: 404 });
  }
}
