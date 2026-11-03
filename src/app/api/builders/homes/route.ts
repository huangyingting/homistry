import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ homes: [] });
  }

  const homes = await prisma.homeBuild.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    homes: homes.map(h => ({
      id: h.id,
      builderName: user.name || 'Partner Builder',
      modelName: h.title,
      facadeName: 'Contemporary Facade',
      status: h.status,
      buildId: h.id,
      createdAt: h.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const modelName = String(body.modelName || '').trim();
  const builderName = String(body.builderName || user.name || 'Homistry Partner Builder').trim();
  const facadeName = String(body.facadeName || 'Standard Facade').trim();

  if (!modelName) {
    return NextResponse.json({ error: 'House model name is required.' }, { status: 400 });
  }

  const home = await prisma.homeBuild.create({
    data: {
      userId: user.id,
      title: `${modelName} (${facadeName})`,
      builder: builderName,
      status: 'ready',
      roofType: 'hip',
      planJson: '{}',
      finishesJson: JSON.stringify({
        claddingStyle: 'weatherboard',
        brickTone: 'cream',
        joineryFinish: 'natural-oak',
        benchtopFinish: 'calacatta',
        floorFinish: 'spotted-gum',
        wallPaint: 'warm-white',
      }),
    },
  });

  return NextResponse.json(
    {
      home: {
        id: home.id,
        builderName,
        modelName,
        facadeName,
        status: home.status,
        buildId: home.id,
        createdAt: home.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
