import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const LOCALES = [
  { code: "en", label: "English", pathSegment: "en", htmlLang: "en" },
  { code: "ms", label: "Bahasa Malaysia", pathSegment: "my", htmlLang: "ms" },
  { code: "zh-Hans", label: "简体中文", pathSegment: "zh", htmlLang: "zh-Hans" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];
export type LocalePathSegment = (typeof LOCALES)[number]["pathSegment"];

export function getLocaleByCode(code: LocaleCode) {
  return LOCALES.find((item) => item.code === code) ?? LOCALES[0];
}

export function getLocaleByPathSegment(segment: string) {
  return LOCALES.find((item) => item.pathSegment === segment) ?? null;
}

export function getLocalePath(segmentOrCode: LocaleCode | LocalePathSegment, slug?: string) {
  const locale =
    LOCALES.find((item) => item.code === segmentOrCode || item.pathSegment === segmentOrCode) ?? LOCALES[0];

  if (!slug) {
    return `/${locale.pathSegment}`;
  }

  return `/${locale.pathSegment}/blog/${slug}`;
}
