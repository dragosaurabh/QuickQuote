import type { Metadata } from 'next';
import { Inter, Creepster } from 'next/font/google';
import { AuthProvider } from '@quickquote/core/components';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Spooky font for headings - Requirements 12.5
const creepster = Creepster({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-creepster',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SpookyQuote - Photographer',
  description: 'Create professional quotes for your photography clients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${creepster.variable} font-body bg-background text-text-primary`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
