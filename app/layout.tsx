import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import { absoluteUrl, serializeJsonLd, siteDescription, siteName, siteUrl } from "@/lib/site";
import { contact } from "@/lib/data";
import { Analytics } from "@vercel/analytics/next";

const inter = localFont({
  src: [
    { path: "../public/fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../public/fonts/inter-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "../public/fonts/fraunces-latin-full-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../public/fonts/fraunces-latin-full-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: {
    default: `${siteName} | Considered Websites & Digital Thinking`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  ...(absoluteUrl("/") ? { alternates: { canonical: absoluteUrl("/") } } : {}),
  keywords: [
    "web design studio",
    "premium websites",
    "Next.js development",
    "luxury web design",
    "digital studio",
    siteName,
  ],
  authors: [{ name: "Ahmed Abdulsalam" }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: `${siteName} | Considered Websites & Digital Thinking`,
    description: siteDescription,
    siteName,
    ...(absoluteUrl("/") ? { url: absoluteUrl("/") } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: Boolean(siteUrl) && process.env.CONTENT_PREVIEW !== "true",
    follow: Boolean(siteUrl) && process.env.CONTENT_PREVIEW !== "true",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    description: siteDescription,
    ...(absoluteUrl("/") ? { url: absoluteUrl("/") } : {}),
    email: contact.email,
    telephone: contact.phone,
    founder: { "@type": "Person", name: "Ahmed Abdulsalam" },
  };

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-bg text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SiteChrome navigation={<Navbar />} footer={<Footer />}>{children}</SiteChrome>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
