import type { Metadata } from "next";
import { getLocalePath, LOCALES, type LocaleCode } from "@/lib/utils";

const localeMetadata = {
  en: {
    homeTitle: "Independent APAC product guides",
    homeDescription: "Clear, independent product decision guides for buyers in Malaysia and Singapore.",
    blogTitle: "Malaysia Tech Comparisons and Buyer Guides",
    blogDescription: "Compare tech products, mobile plans, and creator gear with independent research, transparent tradeoffs, and practical buying context for Malaysia.",
    ogLocale: "en_MY",
  },
  ms: {
    homeTitle: "Panduan produk bebas untuk pembeli APAC",
    homeDescription: "Panduan keputusan produk yang jelas dan bebas untuk pembeli Malaysia dan Singapura.",
    blogTitle: "Perbandingan Teknologi dan Panduan Pembeli Malaysia",
    blogDescription: "Bandingkan produk teknologi, pelan mudah alih dan peralatan pencipta dengan kajian bebas, pertimbangan telus dan konteks pembelian Malaysia.",
    ogLocale: "ms_MY",
  },
  "zh-Hans": {
    homeTitle: "面向亚太买家的独立产品指南",
    homeDescription: "为马来西亚和新加坡买家提供清晰、独立的产品决策指南。",
    blogTitle: "马来西亚科技产品比较与购买指南",
    blogDescription: "通过独立研究、透明的优缺点分析和马来西亚本地购买信息，比较科技产品、移动配套与创作者设备。",
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
