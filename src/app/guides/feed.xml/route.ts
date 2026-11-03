import { NextResponse } from 'next/server';

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Homistry.ai Homeowner Guides</title>
    <link>https://homistry.ai/guides</link>
    <description>Practical guides on turning floor plans into 3D, reading architectural drawings, and choosing finishes.</description>
    <language>en</language>
    <item>
      <title>Floor plan to 3D: how to turn your house plans into a 3D model</title>
      <link>https://homistry.ai/floor-plan-to-3d</link>
      <description>How a 2D architectural floor plan becomes a true-to-scale 3D home you can walk through and furnish.</description>
    </item>
    <item>
      <title>Choosing cladding for a new build</title>
      <link>https://homistry.ai/guides/choosing-cladding-for-a-new-build</link>
      <description>Compare weatherboard, brick, render, vertical timber, stone, and metal cladding with an interactive facade visualizer.</description>
    </item>
    <item>
      <title>How to read a floor plan</title>
      <link>https://homistry.ai/guides/how-to-read-a-floor-plan</link>
      <description>Interactive symbol decoder for architectural doors, windows, stairs, joinery, and dimension strings.</description>
    </item>
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
