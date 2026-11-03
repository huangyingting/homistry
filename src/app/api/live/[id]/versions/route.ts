import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id === 'demo') {
    return NextResponse.json({
      versions: [
        {
          id: 'demo-v38',
          versionNumber: 38,
          label: 'Southern Farmhouse — Baseline 2-storey model',
          createdAt: '2026-10-05T00:00:00.000Z',
        },
      ],
    });
  }

  const versions = await prisma.homeVersion.findMany({
    where: { homeBuildId: id },
    orderBy: { versionNumber: 'desc' },
  });

  return NextResponse.json({ versions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (id === 'demo') {
    return NextResponse.json(
      {
        version: {
          id: `demo-v-${Date.now()}`,
          versionNumber: 39,
          label: body.label || 'Saved revision',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }

  const latest = await prisma.homeVersion.findFirst({
    where: { homeBuildId: id },
    orderBy: { versionNumber: 'desc' },
  });
  const nextVer = (latest?.versionNumber || 0) + 1;

  const created = await prisma.homeVersion.create({
    data: {
      homeBuildId: id,
      versionNumber: nextVer,
      label: body.label || `Version ${nextVer}`,
      planJson: JSON.stringify(body.design || body.plan || {}),
    },
  });

  return NextResponse.json({ version: created }, { status: 201 });
}
