import type { Metadata, Viewport } from 'next';
import { Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-nastaliq-urdu',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pyary Travels - Umrah Management System",
  description: "Pyary Travels & Tours - Umrah, Hajj, Visa & Tours Management SaaS Portal",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="ltr" className={notoNastaliqUrdu.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoNastaliqUrdu.className} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
