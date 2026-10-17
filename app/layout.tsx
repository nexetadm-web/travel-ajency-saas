import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
