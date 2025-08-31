import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Film Club',
  description: 'Vote, watch, and discuss films together.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-white">
          <div className="max-w-4xl mx-auto p-4 font-bold">The Film Club</div>
        </header>
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}

