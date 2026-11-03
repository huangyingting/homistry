import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string; page: string }> }
) {
  const { id, page } = await context.params;
  const pageIdx = parseInt(page.replace(/\.(png|jpg|webp|svg)$/i, ''), 10) || 0;

  const draftFile = await prisma.draftFile.findFirst({
    where: { draftId: id, pageIndex: pageIdx },
  });

  if (!draftFile) {
    return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
  }

  const buffer = Buffer.from(draftFile.dataBase64, 'base64');
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': draftFile.mimeType || 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
