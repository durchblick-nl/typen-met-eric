import type { Metadata } from "next";
import "./globals.css";
import { MagicCursor } from "@/components/ui/MagicCursor";

export const metadata: Metadata = {
  metadataBase: new URL('https://lettoria.nl'),
  title: {
    default: "Lettoria - Gratis typecursus voor kinderen",
    template: "%s | Lettoria",
  },
  description:
    "Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers in de magische wereld van Lettoria. Geen registratie, geen kosten, geen data opslag. Spelenderwijs leren typen met Eric de draak.",
  keywords: [
    "typecursus kinderen",
    "gratis typen leren",
    "blind typen kinderen",
    "10 vinger typen",
    "typeles basisschool",
    "typen oefenen gratis",
    "online typecursus",
    "typen voor kinderen",
    "lettoria",
    "typen met eric",
  ],
  authors: [{ name: "Lettoria" }],
  creator: "Lettoria",
  publisher: "Lettoria",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://lettoria.nl",
    siteName: "Lettoria",
    title: "Lettoria - Gratis typecursus voor kinderen",
    description:
      "Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers in de magische wereld van Lettoria met Eric de draak.",
    images: [
      {
        url: "/images/posters/eric-hero.png",
        width: 1200,
        height: 630,
        alt: "Eric de draak - Lettoria typecursus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lettoria - Gratis typecursus voor kinderen",
    description:
      "Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met Eric de draak.",
    images: ["/images/posters/eric-hero.png"],
  },
  alternates: {
    canonical: "https://lettoria.nl",
  },
  category: "education",
};

// JSON-LD structured data for SEO (static, safe content)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lettoria",
  description:
    "Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers.",
  url: "https://lettoria.nl",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    audienceType: "Children",
    suggestedMinAge: 8,
    suggestedMaxAge: 12,
  },
  inLanguage: "nl",
  isAccessibleForFree: true,
  creator: {
    "@type": "Organization",
    name: "Lettoria",
    url: "https://lettoria.nl",
  },
};

const jsonLdCourse = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Gratis typecursus voor kinderen",
  description:
    "Leer blind typen met 10 vingers in de magische wereld van Lettoria. 23 lessen van thuisrij tot meesterschap.",
  provider: {
    "@type": "Organization",
    name: "Lettoria",
    url: "https://lettoria.nl",
  },
  isAccessibleForFree: true,
  inLanguage: "nl",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
  teaches: "Blind typen met 10 vingers",
  numberOfLessons: 23,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        {/* JSON-LD structured data - static content, safe to inject */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCourse) }}
        />
      </head>
      <body className="bg-perkament min-h-screen">
        {children}
        <MagicCursor />
      </body>
    </html>
  );
}
