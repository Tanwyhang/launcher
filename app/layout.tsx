import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { absoluteUrl, getSiteUrl, SITE_DESCRIPTIONS, SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "launcher | Independent APAC product guides",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTIONS.en,
  applicationName: SITE_NAME,
  category: "technology",
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "launcher | Independent APAC product guides",
    description: SITE_DESCRIPTIONS.en,
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "launcher knowledge cubes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "launcher | Independent APAC product guides",
    description: SITE_DESCRIPTIONS.en,
    images: ["/opengraph-image"],
  },
};

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist",
});

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const htmlLang = requestHeaders.get("x-launcher-locale") || "en";
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon.png"),
        },
        description: SITE_DESCRIPTIONS.en,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTIONS.en,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: ["en", "ms", "zh-Hans"],
      },
    ],
  };

  return (
    <html lang={htmlLang}>
      <body className={geist.variable}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
