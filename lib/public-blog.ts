import type { CmsBlogPost } from "@/lib/sample-data";
import { getLocaleByCode, getLocaleByPathSegment, getLocalePath, type LocaleCode, type LocalePathSegment, LOCALES } from "@/lib/utils";

export function resolveLocaleCodeFromSegment(segment: string): LocaleCode | null {
  return getLocaleByPathSegment(segment)?.code ?? null;
}

export function resolveTranslationForLocale(post: CmsBlogPost, localeCode: LocaleCode) {
  return (
    post.translations.find((item) => item.locale === localeCode) ||
    post.translations.find((item) => item.locale === "en") ||
    post.translations[0]
  );
}

export function getLocalizedPageUrl(localeCode: LocaleCode, slug: string) {
  return getLocalePath(localeCode, slug);
}

export function getLocalizedHomeUrl(localeCode: LocaleCode) {
  return getLocalePath(localeCode);
}

export function buildLanguageAlternates(post: CmsBlogPost) {
  const alternates = Object.fromEntries(
    LOCALES.map((locale) => {
      const translation = resolveTranslationForLocale(post, locale.code);
      return [locale.htmlLang, getLocalizedPageUrl(locale.code, translation.slug)];
    }),
  );

  const english = resolveTranslationForLocale(post, "en");
  return {
    ...alternates,
    "x-default": getLocalizedPageUrl("en", english.slug),
  };
}

export function isSupportedLocaleSegment(segment: string): segment is LocalePathSegment {
  return !!getLocaleByPathSegment(segment);
}

export function getLocaleLabel(code: LocaleCode) {
  return getLocaleByCode(code).label;
}
