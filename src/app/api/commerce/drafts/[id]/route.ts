import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatDraftResponse(draft: {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  state: string;
  houseWidthM: number | null;
  houseLengthM: number | null;
  unit: string;
  consented: boolean;
  paid: boolean;
  buildId: string | null;
  files: { id: string; name: string; mimeType: string; bytes: number; pageIndex: number }[];
}, userCredits = 0, isOwner = false) {
  const formattedFiles = draft.files.map((f, idx) => ({
    id: f.id,
    name: f.name,
    filename: f.name,
    mimeType: f.mimeType,
    bytes: f.bytes,
    sizeBytes: f.bytes,
    pageNumber: idx + 1,
  }));
  const payload = {
    id: draft.id,
    createdAt: draft.createdAt.toISOString(),
    expiresAt: draft.expiresAt.toISOString(),
    files: formattedFiles,
    pageCount: draft.files.length,
    pages: draft.files.map((f, idx) => ({
      index: idx,
      title: '',
      label: f.name,
    })),
    houseSize:
      draft.houseWidthM || draft.houseLengthM
        ? {
            widthM: draft.houseWidthM,
            lengthM: draft.houseLengthM,
            unit: draft.unit,
          }
        : null,
    state: draft.state,
    locked: draft.state === 'built',
    retry: false,
    buildId: draft.buildId,
    queuePosition: null,
    paid: draft.paid,
    message: null,
    supportHref: null,
    filesKept: true,
    credits: userCredits,
    owner: isOwner,
    consented: draft.consented,
    limits: {
      maxFiles: 4,
      maxPages: 30,
      maxUploadBytes: 10485760,
      maxTotalBytes: 10485760,
    },
  };
  return {
    ...payload,
    draft: payload,
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const draft = await prisma.draft.findUnique({
    where: { id },
    include: { files: { orderBy: { pageIndex: 'asc' } } },
  });

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
  }

  return NextResponse.json(
    formatDraftResponse(draft, user?.credits ?? 0, user?.role === 'ADMIN')
  );
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.draft.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
  }

  const updated = await prisma.draft.update({
    where: { id },
    data: {
      houseWidthM: body.widthM !== undefined ? Number(body.widthM) || null : existing.houseWidthM,
      houseLengthM: body.lengthM !== undefined ? Number(body.lengthM) || null : existing.houseLengthM,
      unit: body.unit === 'm' ? 'm' : body.unit === 'ft' ? 'ft' : existing.unit,
      consented: body.consented !== undefined ? Boolean(body.consented) : existing.consented,
    },
    include: { files: { orderBy: { pageIndex: 'asc' } } },
  });

  return NextResponse.json(
    formatDraftResponse(updated, user?.credits ?? 0, user?.role === 'ADMIN')
  );
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}
