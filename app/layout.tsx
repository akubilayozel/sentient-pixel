export const metadata = { title: 'Sentient Pixel', description: 'Community-powered logo' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
