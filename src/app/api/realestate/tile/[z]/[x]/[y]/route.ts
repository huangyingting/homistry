import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#E8EAE3"/>
    <path d="M0 64h256M0 128h256M0 192h256M64 0v256M128 0v256M192 0v256" stroke="#D7DBD0" stroke-width="1"/>
    <path d="M16 220 Q128 110 240 42" stroke="#C5CCBD" stroke-width="5" fill="none"/>
    <text x="12" y="242" font-family="monospace" font-size="10" fill="#8C9386">Tile ${z}/${x}/${y}</text>
  </svg>`;
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
