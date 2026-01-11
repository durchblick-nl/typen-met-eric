import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-perkament min-h-screen">{children}</body>
    </html>
  );
}
