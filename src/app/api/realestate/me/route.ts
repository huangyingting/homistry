import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      signedIn: false,
      owner: false,
      email: null,
      allowed: false,
      access: 'list',
      request: null,
      agent: null,
    });
  }

  return NextResponse.json({
    signedIn: true,
    owner: user.role === 'ADMIN',
    email: user.email,
    allowed: true,
    access: 'list',
    request: { status: 'approved' },
    agent: {
      id: user.id,
      email: user.email,
      name: user.name || 'Real Estate Agent',
      agencyName: 'Partner Agency',
      role: user.role,
    },
  });
}

