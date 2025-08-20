import './globals.css';
import type { Metadata } from 'next';
import AuthWidget from '../components/AuthWidget';

export const metadata: Metadata = {
  title: 'מועדון סרטים',
  description: 'הצטרפו למועדון הסרטים – מצביעים, צופים ומדברים על סרטים יחד',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 mb-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
            <a href="/" className="text-2xl font-bold">מועדון סרטים</a>
            <AuthWidget />
          </div>
        </header>
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}