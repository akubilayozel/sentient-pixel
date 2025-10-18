// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sentient Community Pixel — Build it together',
  description:
    'Place pixels together. Upload an image, leave a note, build it together.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen min-h-dvh bg-[var(--sentient-pink)] text-white antialiased">
        {/* Top header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <h1 className="text-sm font-semibold tracking-wide md:text-base">
              <span className="opacity-95">Sentient Community Pixel</span>{' '}
              <span className="opacity-70">— Build it together</span>
            </h1>
          </div>
        </header>

        {/* Header yüksekliği kadar boşluk */}
        <main className="pt-14 md:pt-16">{children}</main>
      </body>
    </html>
  );
}
