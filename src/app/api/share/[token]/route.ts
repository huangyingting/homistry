import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      homeBuild: {
        include: {
          pieces: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });

  if (!shareLink || !shareLink.active || shareLink.revokedAt || !shareLink.homeBuild) {
    return NextResponse.json(
      {
        error: 'This share link is unavailable. The owner may have stopped sharing.',
      },
      { status: 404 }
    );
  }

  const build = shareLink.homeBuild;
  return NextResponse.json({
    token: shareLink.token,
    viewOnly: true,
    home: {
      id: build.id,
      title: build.title,
      builder: build.builder,
      storeys: build.storeys,
      unit: build.unit,
      roofType: build.roofType,
      plan: (() => {
        try {
          return JSON.parse(build.planJson);
        } catch {
          return {};
        }
      })(),
      finishes: (() => {
        try {
          return JSON.parse(build.finishesJson);
        } catch {
          return {};
        }
      })(),
      pieces: build.pieces,
    },
  });
}
