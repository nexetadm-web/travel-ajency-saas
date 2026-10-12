import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Travel Agency SaaS - Umrah, Hajj & Ticketing ERP',
  description: 'Enterprise Travel Agency SaaS with Turso DB, Drizzle ORM, WhatsApp Automation & Dynamic Agency Branding',
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
