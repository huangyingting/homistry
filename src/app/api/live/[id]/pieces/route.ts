import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const pieces = await prisma.placedPiece.findMany({
    where: { homeBuildId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ pieces });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const piece = await prisma.placedPiece.create({
    data: {
      homeBuildId: id,
      catalogId: String(body.catalogId || 'sofa-3seat'),
      name: String(body.name || '3-seat sofa'),
      category: String(body.category || 'Sofas'),
      floorIndex: Number(body.floorIndex || 0),
      roomKey: body.roomKey ? String(body.roomKey) : null,
      x: Number(body.x ?? 4.2),
      y: Number(body.y ?? 0),
      z: Number(body.z ?? 3.8),
      rotation: Number(body.rotation ?? 0),
      width: Number(body.width ?? 2.1),
      depth: Number(body.depth ?? 0.9),
      height: Number(body.height ?? 0.85),
      colour: String(body.colour || '#8C857B'),
    },
  });

  return NextResponse.json({ piece }, { status: 201 });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  const body = await req.json().catch(() => ({}));
  const pieceId = String(body.pieceId || body.id || '');
  if (!pieceId) {
    return NextResponse.json({ error: 'Piece ID is required.' }, { status: 400 });
  }

  const existing = await prisma.placedPiece.findUnique({ where: { id: pieceId } });
  if (!existing) {
    return NextResponse.json({ error: 'Piece not found.' }, { status: 404 });
  }

  const updated = await prisma.placedPiece.update({
    where: { id: pieceId },
    data: {
      x: body.x !== undefined ? Number(body.x) : existing.x,
      y: body.y !== undefined ? Number(body.y) : existing.y,
      z: body.z !== undefined ? Number(body.z) : existing.z,
      rotation: body.rotation !== undefined ? Number(body.rotation) : existing.rotation,
      width: body.width !== undefined ? Number(body.width) : existing.width,
      depth: body.depth !== undefined ? Number(body.depth) : existing.depth,
      height: body.height !== undefined ? Number(body.height) : existing.height,
      colour: body.colour !== undefined ? String(body.colour) : existing.colour,
    },
  });

  return NextResponse.json({ piece: updated });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  const url = new URL(req.url);
  const pieceId = url.searchParams.get('pieceId') || '';
  if (!pieceId) {
    return NextResponse.json({ error: 'pieceId query parameter required.' }, { status: 400 });
  }

  await prisma.placedPiece.deleteMany({ where: { id: pieceId } });
  return NextResponse.json({ deleted: true });
}
