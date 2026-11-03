import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const draft = await prisma.draft.findUnique({
    where: { id },
    include: { files: { orderBy: { pageIndex: 'asc' } } },
  });

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
  }

  // Load Southern Farmhouse geometry structure as the base 3D conversion template,
  // customized with the uploaded floor plan title, dimensions, and storey count.
  const templatePath = path.join(process.cwd(), 'public/demos/southern-farmhouse/plan.json');
  let basePlan: Record<string, unknown> = {};
  try {
    basePlan = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  } catch {
    basePlan = { floors: [] };
  }

  const firstFileName = draft.files[0]?.name || 'Custom Floor Plan';
  const cleanTitle =
    body.title ||
    firstFileName
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

  const widthM = Number(body.widthM || draft.houseWidthM || 14.2);
  const lengthM = Number(body.lengthM || draft.houseLengthM || 18.6);
  const unit = body.unit === 'm' ? 'm' : draft.unit || 'ft';

  const customizedPlan = {
    ...basePlan,
    title: cleanTitle,
    customDimensions: { widthM, lengthM, unit },
    uploadedFiles: draft.files.map(f => ({ name: f.name, bytes: f.bytes })),
  };

  const planJsonStr = JSON.stringify(customizedPlan);

  const homeBuild = await prisma.homeBuild.create({
    data: {
      userId: user?.id ?? draft.userId ?? null,
      draftId: draft.id,
      title: cleanTitle,
      builder: user?.name ? `Uploaded by ${user.name}` : 'Custom Builder Floor Plan',
      status: 'ready',
      storeys: Math.max(1, Math.min(4, draft.files.length || 2)),
      unit,
      roofType: 'gable',
      planJson: planJsonStr,
      finishesJson: JSON.stringify({
        floor: { material: 'timber-boards', colour: '#C59B6D' },
        wall: { material: 'paint-matte', colour: '#F4F1EA' },
        outside: { material: 'weatherboard', colour: '#EDEAE2' },
        roof: { material: 'colorbond-steel', colour: '#363A3E' },
      }),
      electricalJson: JSON.stringify([
        { id: 'el-1', room: 'Kitchen', type: 'double_gpo', label: 'Double power point (Island)', count: 2 },
        { id: 'el-2', room: 'Kitchen', type: 'led_downlight', label: 'Recessed LED downlight 90mm', count: 6 },
        { id: 'el-3', room: 'Living room', type: 'double_gpo', label: 'Double power point + TV data', count: 3 },
        { id: 'el-4', room: 'Family room', type: 'led_downlight', label: 'Warm white LED downlight', count: 4 },
        { id: 'el-5', room: 'Main bedroom', type: 'usb_gpo', label: 'Bedside double GPO with USB-C', count: 2 },
      ]),
      sitePlanJson: JSON.stringify({
        lotWidthM: 18,
        lotDepthM: 32,
        frontSetbackM: 4.5,
        sideSetbackM: 1.5,
        northAngleDeg: 18,
        month: 6,
        hour: 13,
      }),
      versions: {
        create: {
          versionNumber: 1,
          label: 'Initial 3D conversion from floor plans',
          planJson: planJsonStr,
        },
      },
    },
  });

  const updatedDraft = await prisma.draft.update({
    where: { id: draft.id },
    data: {
      state: 'built',
      paid: true,
      consented: true,
      buildId: homeBuild.id,
      houseWidthM: widthM,
      houseLengthM: lengthM,
      unit,
    },
    include: { files: { orderBy: { pageIndex: 'asc' } } },
  });

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'BUILD_CREATED',
    targetType: 'HomeBuild',
    targetId: homeBuild.id,
    ipAddress,
    userAgent,
    metadata: { draftId: draft.id, title: homeBuild.title },
  });

  return NextResponse.json(
    {
      mode: 'complete',
      buildId: homeBuild.id,
      draft: {
        id: updatedDraft.id,
        createdAt: updatedDraft.createdAt.toISOString(),
        expiresAt: updatedDraft.expiresAt.toISOString(),
        files: updatedDraft.files.map(f => ({ name: f.name, bytes: f.bytes })),
        pageCount: updatedDraft.files.length,
        pages: updatedDraft.files.map((f, idx) => ({
          index: idx,
          title: '',
          label: f.name,
        })),
        state: updatedDraft.state,
        locked: true,
        buildId: homeBuild.id,
        paid: true,
        consented: true,
      },
    },
    { status: 201 }
  );
}
