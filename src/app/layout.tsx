import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homistry — Your floor plan, as a home you can walk through',
  description:
    'Drop in the floor plan your builder sent you. Walk through every room in 3D, try furniture to scale, test daylight and claddings, and check your layout before the slab is poured.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
