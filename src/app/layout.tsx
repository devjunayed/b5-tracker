import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Course Dashboard - Batch 5',
  description: 'Track all course, mission, and module progress',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
