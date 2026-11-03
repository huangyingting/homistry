import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id === 'demo') {
    const planPath = path.join(process.cwd(), 'public/demos/southern-farmhouse/plan.json');
    const metaPath = path.join(process.cwd(), 'public/demos/southern-farmhouse/metadata.json');
    const plan = fs.existsSync(planPath)
      ? JSON.parse(fs.readFileSync(planPath, 'utf8'))
      : {};
    const metadata = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      : {};

    return NextResponse.json({
      id: 'demo',
      title: metadata.title || 'Southern Farmhouse (Demo)',
      status: 'READY',
      storeys: 2,
      unit: 'ft',
      plan,
      metadata,
      pieces: [],
    });
  }

  const build = await prisma.homeBuild.findUnique({
    where: { id },
    include: {
      pieces: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 10,
      },
    },
  });

  if (!build) {
    return NextResponse.json({ error: 'Home build not found.' }, { status: 404 });
  }

  let plan: Record<string, unknown> = {};
  try {
    plan = JSON.parse(build.planJson);
  } catch {
    plan = {};
  }

  return NextResponse.json({
    id: build.id,
    title: build.title,
    status: build.status,
    storeys: build.storeys,
    unit: build.unit,
    ceilingGroundM: build.ceilingGroundM,
    ceilingUpperM: build.ceilingUpperM,
    roofType: build.roofType,
    plan,
    pieces: build.pieces,
    versions: build.versions,
  });
}
