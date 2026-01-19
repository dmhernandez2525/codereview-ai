import localFont from 'next/font/local';

import { Providers } from '@/components/providers';

import type { Metadata, Viewport } from 'next';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'CodeReview AI',
    template: '%s | CodeReview AI',
  },
  description:
    'AI-powered code reviews for your pull requests. Self-hostable, BYOK support, zero data retention.',
  keywords: ['code review', 'AI', 'pull request', 'GitHub', 'GitLab', 'code quality'],
  authors: [{ name: 'CodeReview AI' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
