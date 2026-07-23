import './globals.css';
import type { Metadata } from 'next';

// This is the main layout for the whole app.
export const metadata: Metadata = {
  title: 'Custom Draft Simulator',
  description: 'A student-friendly fantasy draft simulator built with Next.js and MongoDB.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
