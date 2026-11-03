import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SAMPLE_RENDER_MAP: Record<string, string> = {
  kitchen: '/site/ridgeline/pr/kitchen-b.jpg',
  living: '/site/ridgeline/pr/living-b.jpg',
  front: '/site/ridgeline/pr/front-b.jpg',
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const renders = await prisma.frameRender.findMany({
    where: { homeBuildId: id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ renders });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));

  const roomName = String(body.roomName || 'Living room');
  const style = String(body.style || 'Daylight architectural');
  const lower = roomName.toLowerCase();
  const imageUrl = lower.includes('kitchen')
    ? SAMPLE_RENDER_MAP.kitchen
    : lower.includes('front') || lower.includes('porch') || lower.includes('outside')
      ? SAMPLE_RENDER_MAP.front
      : SAMPLE_RENDER_MAP.living;

  const render = await prisma.frameRender.create({
    data: {
      homeBuildId: id,
      roomName,
      style,
      prompt: body.prompt ? String(body.prompt) : null,
      cameraJson: JSON.stringify(body.camera || {}),
      imageUrl,
    },
  });

  if (user && user.credits > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: Math.max(0, user.credits - 1) },
    });
  }

  return NextResponse.json({ render }, { status: 201 });
}
