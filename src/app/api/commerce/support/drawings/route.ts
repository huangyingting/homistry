import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No drawing file provided.' }, { status: 400 });
  }

  return NextResponse.json({
    drawing: {
      id: `drw-${Date.now()}`,
      name: file.name,
      bytes: file.size,
      mimeType: file.type || 'application/octet-stream',
    },
  });
}
