import type { Metadata } from "next";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Río Cuarto`,
    template: `%s | Doña Ríos`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "keto Río Cuarto",
    "low carb Río Cuarto",
    "productos sin gluten Río Cuarto",
    "almacén saludable Río Cuarto",
    "dietética online Río Cuarto",
    "comida sin azúcar Córdoba",
  ],
  authors: [{ name: "Doña Ríos" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// Datos estructurados de negocio local: ayudan tanto al SEO tradicional (Google)
// como a los buscadores/asistentes con IA a entender qué es Doña Ríos, dónde opera
// y cómo contactarla, sin inventar un domicilio físico que no existe (es 100% online).
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS.name,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: `+${BUSINESS.whatsapp}`,
  areaServed: {
    "@type": "City",
    name: BUSINESS.city,
    containedInPlace: { "@type": "AdministrativeArea", name: BUSINESS.region },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
  },
  sameAs: [`https://instagram.com/${BUSINESS.instagram}`],
  priceRange: "$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-cream text-forest">
        <JsonLd data={localBusinessJsonLd} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
