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
    sitePlan: (() => {
      try {
        return JSON.parse(build.sitePlanJson);
      } catch {
        return {};
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
  const sitePlan = body.sitePlan || body;

  await prisma.homeBuild.update({
    where: { id },
    data: { sitePlanJson: JSON.stringify(sitePlan) },
  });

  return NextResponse.json({ saved: true, sitePlan });
}
