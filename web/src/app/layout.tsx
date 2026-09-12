import type { Metadata, Viewport } from "next";
import { Marcellus, Source_Sans_3 } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { OrderProvider } from "@/components/OrderProvider";
import { ServiceWorker } from "@/components/ServiceWorker";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { site } from "@/content/site";

import "./globals.css";

const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus", display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Gift hampers for staff, clients and partners`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_NG",
    url: "/",
    title: `${site.name} · Gift hampers for staff, clients and partners`,
    description: site.description,
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "Lustre by Kal gift hampers from ₦160,000" }],
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: site.shortName, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fcfbf8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${marcellus.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Store",
            name: site.name,
            url: site.url,
            logo: `${site.url}/icons/icon-512.png`,
            image: `${site.url}/og/default.png`,
            email: site.email,
            ...(site.whatsapp ? { telephone: `+${site.whatsapp}` } : {}),
            description: site.description,
            areaServed: { "@type": "Country", name: "Nigeria" },
            currenciesAccepted: "NGN",
          }}
        />
        <OrderProvider>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </OrderProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
