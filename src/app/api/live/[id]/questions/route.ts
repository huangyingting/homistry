import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    buildId: id,
    questions: [
      {
        id: 'ceiling_height',
        prompt: 'What is the ground floor ceiling height?',
        options: ['2.4 m (8 ft)', '2.55 m (8 ft 4 in)', '2.7 m (9 ft)', '3.0 m (10 ft)'],
        selected: '2.55 m (8 ft 4 in)',
      },
      {
        id: 'roof_shape',
        prompt: 'What is the main roof shape?',
        options: ['Gable', 'Hip', 'Flat / Skillion'],
        selected: 'Gable',
      },
    ],
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    buildId: id,
    answers: body,
  });
}
