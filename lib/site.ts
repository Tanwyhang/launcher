export const SITE_NAME = "launcher";

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return configuredUrl ? withProtocol(configuredUrl).replace(/\/$/, "") : "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export const SITE_DESCRIPTIONS = {
  en: "Independent, trilingual product decision guides for Malaysia and Singapore.",
  ms: "Panduan keputusan produk bebas dalam tiga bahasa untuk Malaysia dan Singapura.",
  "zh-Hans": "面向马来西亚和新加坡读者的独立三语产品决策指南。",
} as const;
