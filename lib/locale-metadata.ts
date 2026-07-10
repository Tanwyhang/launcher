import type { Metadata } from "next";
import { getLocalePath, LOCALES, type LocaleCode } from "@/lib/utils";

const localeMetadata = {
  en: {
    homeTitle: "Independent APAC product guides",
    homeDescription: "Clear, independent product decision guides for buyers in Malaysia and Singapore.",
    blogTitle: "Product comparisons and buying guides",
    blogDescription: "Compare technology products with transparent tradeoffs and Malaysia-Singapore buying context.",
    ogLocale: "en_MY",
  },
  ms: {
    homeTitle: "Panduan produk bebas untuk pembeli APAC",
    homeDescription: "Panduan keputusan produk yang jelas dan bebas untuk pembeli Malaysia dan Singapura.",
    blogTitle: "Perbandingan produk dan panduan membeli",
    blogDescription: "Bandingkan produk teknologi dengan tradeoff telus dan konteks pembeli Malaysia-Singapura.",
    ogLocale: "ms_MY",
  },
  "zh-Hans": {
    homeTitle: "面向亚太买家的独立产品指南",
    homeDescription: "为马来西亚和新加坡买家提供清晰、独立的产品决策指南。",
    blogTitle: "产品比较与购买指南",
    blogDescription: "通过透明取舍与马新购买语境，比较适合你的科技产品。",
    ogLocale: "zh_CN",
  },
} as const;

function languages(pathSuffix = "") {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale.htmlLang, `${getLocalePath(locale.code)}${pathSuffix}`])),
    "x-default": `/en${pathSuffix}`,
  };
}

export function buildLocaleMetadata(locale: LocaleCode, page: "home" | "blog"): Metadata {
  const copy = localeMetadata[locale];
  const title = page === "home" ? copy.homeTitle : copy.blogTitle;
  const description = page === "home" ? copy.homeDescription : copy.blogDescription;
  const pathSuffix = page === "blog" ? "/blog" : "";
  const canonical = `${getLocalePath(locale)}${pathSuffix}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languages(pathSuffix),
    },
    openGraph: {
      type: "website",
      siteName: "launcher",
      title,
      description,
      url: canonical,
      locale: copy.ogLocale,
      alternateLocale: Object.values(localeMetadata).map((item) => item.ogLocale).filter((item) => item !== copy.ogLocale),
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function getOpenGraphLocale(locale: LocaleCode) {
  return localeMetadata[locale].ogLocale;
}
