import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Module Tracker — Batch 5',
  description: 'Track your Batch 5 course progress',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
