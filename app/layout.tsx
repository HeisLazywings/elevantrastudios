import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default:
      "Elevanta Studio | Digital Experiences That Elevate Businesses",
    template: "%s | Elevanta Studio",
  },
  description:
    "Elevanta Studio designs and develops premium websites that help businesses establish credibility, attract customers, and grow online.",
  keywords: [
    "web design studio",
    "premium websites",
    "Next.js development",
    "luxury web design",
    "digital studio",
    "Elevanta Studio",
  ],
  authors: [{ name: "Ahmed Abdulsalam" }],
  creator: "Elevanta Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    title:
      "Elevanta Studio | Digital Experiences That Elevate Businesses",
    description:
      "Premium websites that help ambitious businesses build trust, attract customers, and create lasting impressions.",
    siteName: "Elevanta Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevanta Studio",
    description:
      "Digital experiences that elevate businesses.",
  },
  robots: {
    index: true,
    follow: true,
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
    name: "Elevanta Studio",
    description:
      "Elevanta Studio designs and develops premium websites that help businesses establish credibility, attract customers, and grow online.",
    email: "ahmednickoliver@gmail.com",
    telephone: "+2349030759734",
    founder: { "@type": "Person", name: "Ahmed Abdulsalam" },
    sameAs: [],
  };

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-bg text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
