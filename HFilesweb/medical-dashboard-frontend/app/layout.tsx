import './globals.css'

export const metadata = {
  title: 'Medical Dashboard',
  description: 'Manage your medical records',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}