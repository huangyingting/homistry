import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (id === 'demo') {
    return NextResponse.json({ ok: true, id: 'demo', settings: body });
  }

  const build = await prisma.homeBuild.findUnique({ where: { id } });
  if (!build) {
    return NextResponse.json({ error: 'Build not found.' }, { status: 404 });
  }

  const updated = await prisma.homeBuild.update({
    where: { id },
    data: {
      storeys: typeof body.storeys === 'number' ? body.storeys : build.storeys,
      unit: typeof body.unit === 'string' ? body.unit : build.unit,
      ceilingGroundM:
        typeof body.ceilingGroundM === 'number' ? body.ceilingGroundM : build.ceilingGroundM,
      ceilingUpperM:
        typeof body.ceilingUpperM === 'number' ? body.ceilingUpperM : build.ceilingUpperM,
      roofType: typeof body.roofType === 'string' ? body.roofType : build.roofType,
    },
  });

  return NextResponse.json({ ok: true, build: updated });
}
