import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ builder: null });
  }

  return NextResponse.json({
    builder: {
      id: user.id,
      email: user.email,
      name: user.name || 'Home Builder Partner',
      builderName: 'Partner Builder',
      role: user.role,
    },
  });
}
