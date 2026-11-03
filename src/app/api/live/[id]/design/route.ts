import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const build = await prisma.homeBuild.findUnique({
    where: { id },
    include: {
      pieces: { orderBy: { createdAt: 'asc' } },
      versions: { orderBy: { versionNumber: 'desc' }, take: 20 },
      frameRenders: { orderBy: { createdAt: 'desc' } },
      shareLinks: { where: { active: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!build) {
    return NextResponse.json({ error: 'Home build not found.' }, { status: 404 });
  }

  return NextResponse.json({
    id: build.id,
    title: build.title,
    builder: build.builder,
    status: build.status,
    storeys: build.storeys,
    unit: build.unit,
    roofType: build.roofType,
    ceilingGroundM: build.ceilingGroundM,
    ceilingUpperM: build.ceilingUpperM,
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
    electrical: (() => {
      try {
        return JSON.parse(build.electricalJson);
      } catch {
        return [];
      }
    })(),
    sitePlan: (() => {
      try {
        return JSON.parse(build.sitePlanJson);
      } catch {
        return {};
      }
    })(),
    pieces: build.pieces,
    versions: build.versions.map(v => ({
      id: v.id,
      versionNumber: v.versionNumber,
      label: v.label,
      createdAt: v.createdAt.toISOString(),
    })),
    frameRenders: build.frameRenders,
    activeShareToken: build.shareLinks[0]?.token ?? null,
    updatedAt: build.updatedAt.toISOString(),
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const existing = await prisma.homeBuild.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Home build not found.' }, { status: 404 });
  }

  const nextPlanJson = body.plan ? JSON.stringify(body.plan) : existing.planJson;
  const nextFinishesJson = body.finishes
    ? JSON.stringify(body.finishes)
    : existing.finishesJson;

  const updated = await prisma.homeBuild.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      storeys: body.storeys !== undefined ? Number(body.storeys) : existing.storeys,
      unit: body.unit === 'm' || body.unit === 'ft' ? body.unit : existing.unit,
      roofType: body.roofType ?? existing.roofType,
      ceilingGroundM:
        body.ceilingGroundM !== undefined
          ? Number(body.ceilingGroundM)
          : existing.ceilingGroundM,
      ceilingUpperM:
        body.ceilingUpperM !== undefined
          ? Number(body.ceilingUpperM)
          : existing.ceilingUpperM,
      planJson: nextPlanJson,
      finishesJson: nextFinishesJson,
    },
  });

  if (body.saveVersion) {
    const nextVer = (existing.versions[0]?.versionNumber || 1) + 1;
    await prisma.homeVersion.create({
      data: {
        homeBuildId: id,
        versionNumber: nextVer,
        label: String(body.versionLabel || `Saved revision #${nextVer}`),
        planJson: nextPlanJson,
      },
    });
  }

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'DESIGN_UPDATED',
    targetType: 'HomeBuild',
    targetId: id,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ saved: true, updatedAt: updated.updatedAt.toISOString() });
}
