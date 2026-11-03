import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ homes: [] });
  }

  const rows = await prisma.realEstateListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const homes = rows.map((r, idx) => ({
    id: r.id,
    agencyName: r.agencyName,
    agentName: r.agentName,
    address: r.address,
    suburb: r.suburb,
    state: r.state,
    postcode: r.postcode,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    addedAt: r.createdAt.toISOString(),
    source: `${r.agencyName} (agent listing)`,
    country: 'AU',
    place: [-37.822 + idx * 0.008, 145.035 + idx * 0.009] as [number, number],
    pictures: ['front.jpg'],
    facts: {
      beds: 4,
      baths: 2,
      cars: 2,
      area: 245,
      storeys: 2,
    },
  }));

  return NextResponse.json({ homes });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const address = String(body.address || '').trim();
  const agencyName = String(body.agencyName || 'Homistry Partner Agency').trim();
  const agentName = String(body.agentName || user.name || user.email).trim();

  if (!address) {
    return NextResponse.json({ error: 'Property address is required.' }, { status: 400 });
  }

  const listing = await prisma.realEstateListing.create({
    data: {
      userId: user.id,
      agencyName,
      agentName,
      email: user.email,
      address,
      suburb: body.suburb ? String(body.suburb) : null,
      state: body.state ? String(body.state) : null,
      postcode: body.postcode ? String(body.postcode) : null,
      status: 'ready',
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}

