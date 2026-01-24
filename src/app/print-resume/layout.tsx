export const dynamic = 'force-dynamic';
import '../globals.css';

export default function PrintResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
