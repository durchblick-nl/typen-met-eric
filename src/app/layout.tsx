import { t } from '@/lib/i18n';
import { COURSE_URL, LANGUAGE } from '@/lib/course';
import { CourseSelector } from '@/components/settings/CourseSelector';
import type { Metadata } from "next";
import "./globals.css";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { ComfortProvider } from '@/components/settings/ComfortSettings';
import { StorageNotice } from '@/components/settings/StorageNotice';
import { PrivacyConsent } from '@/components/privacy/PrivacyConsent';

export const metadata: Metadata = {
  metadataBase: new URL(COURSE_URL),
  title: {
    default: t("Lettoria - Gratis typecursus voor kinderen"),
    template: "%s | Lettoria",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  description:
    t("Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers in de magische wereld van Lettoria. Geen registratie, geen kosten. Je voortgang blijft lokaal op je apparaat. Spelenderwijs leren typen met Eric de draak."),
  keywords: [
    t("typecursus kinderen"),
    t("gratis typen leren"),
    t("blind typen kinderen"),
    t("10 vinger typen"),
    t("typeles basisschool"),
    t("typen oefenen gratis"),
    t("online typecursus"),
    t("typen voor kinderen"),
    "lettoria",
    t("typen met eric"),
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
    locale: LANGUAGE.replace('-', '_'),
    url: COURSE_URL,
    siteName: "Lettoria",
    title: t("Lettoria - Gratis typecursus voor kinderen"),
    description:
      t("Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers in de magische wereld van Lettoria met Eric de draak."),
    images: [
      {
        url: "/images/posters/eric-hero.png",
        width: 1200,
        height: 630,
        alt: t("Eric de draak - Lettoria typecursus"),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t("Lettoria - Gratis typecursus voor kinderen"),
    description:
      t("Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met Eric de draak."),
    images: ["/images/posters/eric-hero.png"],
  },
  alternates: {
    canonical: COURSE_URL,
    languages: {'nl-NL':'https://lettoria.app/','nl-BE':'https://lettoria.app/be/','de-DE':'https://lettoria.app/de/','de-CH':'https://lettoria.app/ch/'},
  },
  category: "education",
};

// JSON-LD structured data for SEO (static, safe content)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lettoria",
  description:
    t("Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met 10 vingers."),
  url: COURSE_URL,
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
  inLanguage: LANGUAGE,
  isAccessibleForFree: true,
  creator: {
    "@type": "Organization",
    name: "Lettoria",
    url: COURSE_URL,
  },
};

const jsonLdCourse = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: t("Gratis typecursus voor kinderen"),
  description:
    t("Leer blind typen met 10 vingers in de magische wereld van Lettoria. 26 lessen van thuisrij tot meesterschap."),
  provider: {
    "@type": "Organization",
    name: "Lettoria",
    url: COURSE_URL,
  },
  isAccessibleForFree: true,
  inLanguage: LANGUAGE,
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
  teaches: t("Blind typen met 10 vingers"),
  numberOfLessons: 26,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LANGUAGE}>
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
        <CourseSelector />
        <ComfortProvider><StorageNotice />{children}</ComfortProvider>
        <PrivacyConsent />
      </body>
    </html>
  );
}
