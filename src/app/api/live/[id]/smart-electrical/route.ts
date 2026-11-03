import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const build = await prisma.homeBuild.findUnique({ where: { id } });
  if (!build) {
    return NextResponse.json({ error: 'Home build not found.' }, { status: 404 });
  }

  return NextResponse.json({
    items: (() => {
      try {
        return JSON.parse(build.electricalJson);
      } catch {
        return [];
      }
    })(),
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];

  await prisma.homeBuild.update({
    where: { id },
    data: { electricalJson: JSON.stringify(items) },
  });

  return NextResponse.json({ saved: true, items });
}
