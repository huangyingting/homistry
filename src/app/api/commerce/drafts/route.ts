import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf'];
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

function isValidFloorPlanFile(file: File): boolean {
  const lowerName = (file.name || '').toLowerCase();
  const extMatch = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  const mimeMatch = ALLOWED_MIME_TYPES.includes((file.type || '').toLowerCase());
  return extMatch || mimeMatch;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { ipAddress, userAgent } = extractRequestMeta(req);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload form data.' }, { status: 400 });
  }

  const uploadedFiles: File[] = [];
  for (const [, value] of formData.entries()) {
    if (typeof value === 'object' && value !== null && 'arrayBuffer' in value && 'name' in value) {
      uploadedFiles.push(value as File);
    }
  }

  if (uploadedFiles.length === 0) {
    return NextResponse.json({ error: 'Choose at least one floor plan file.' }, { status: 400 });
  }

  if (uploadedFiles.length > 4) {
    return NextResponse.json(
      { error: 'Up to 4 files can be uploaded at once.' },
      { status: 400 }
    );
  }

  let totalBytes = 0;
  for (const file of uploadedFiles) {
    if (!isValidFloorPlanFile(file)) {
      return NextResponse.json(
        { error: `${file.name} is not a PNG, JPEG, WebP, SVG or PDF file.` },
        { status: 400 }
      );
    }
    totalBytes += file.size;
  }

  if (totalBytes > 10485760) {
    return NextResponse.json(
      { error: 'Total file size exceeds the 10 MB limit.' },
      { status: 400 }
    );
  }

  const filePayloads = await Promise.all(
    uploadedFiles.map(async (f, index) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return {
        name: f.name,
        mimeType: f.type || 'image/png',
        bytes: buf.length,
        dataBase64: buf.toString('base64'),
        pageIndex: index,
      };
    })
  );

  const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);
  const draft = await prisma.draft.create({
    data: {
      userId: user?.id ?? null,
      state: 'open',
      expiresAt,
      files: {
        create: filePayloads,
      },
    },
    include: { files: true },
  });

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'DRAFT_CREATED',
    targetType: 'Draft',
    targetId: draft.id,
    ipAddress,
    userAgent,
    metadata: {
      fileCount: draft.files.length,
      files: draft.files.map(f => ({ name: f.name, bytes: f.bytes })),
    },
  });

  const formattedFiles = draft.files.map((f, idx) => ({
    id: f.id,
    name: f.name,
    filename: f.name,
    mimeType: f.mimeType,
    bytes: f.bytes,
    sizeBytes: f.bytes,
    pageNumber: idx + 1,
  }));

  return NextResponse.json(
    {
      id: draft.id,
      draft: {
        id: draft.id,
        files: formattedFiles,
      },
      createdAt: draft.createdAt.toISOString(),
      expiresAt: draft.expiresAt.toISOString(),
      files: formattedFiles,
      pageCount: draft.files.length,
      pages: draft.files.map((f, idx) => ({
        index: idx,
        title: '',
        label: f.name,
      })),
      houseSize: null,
      state: draft.state,
      locked: false,
      retry: false,
      buildId: draft.buildId,
      queuePosition: null,
      paid: draft.paid,
      message: null,
      supportHref: null,
      filesKept: true,
      credits: user?.credits ?? 0,
      owner: user?.role === 'ADMIN',
      consented: draft.consented,
      limits: {
        maxFiles: 4,
        maxPages: 30,
        maxUploadBytes: 10485760,
        maxTotalBytes: 10485760,
      },
    },
    { status: 201 }
  );
}
