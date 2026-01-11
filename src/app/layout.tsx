import type { Metadata } from "next";
import "./globals.css";
import { MagicCursor } from "@/components/ui/MagicCursor";

export const metadata: Metadata = {
  title: "Typen met Eric",
  description: "Leer typen met Eric de draak in de magische wereld van Lettoria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="bg-perkament min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Magic Cursor is client-side only, so we invoke it via a separate Client Component wrapper if finding direct use tricky, but since layout is server, we need to import it properly or use a dynamic import if it was not 'use client'. MagicCursor IS 'use client', so we can import it directly if this was a client component, but layout is server. 
           Wait, MagicCursor is 'use client', so it can be rendered in a server component (RootLayout). */}
        </div>
        {children}
        <MagicCursor />
      </body>
    </html>
  );
}
