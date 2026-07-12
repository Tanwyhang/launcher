import type { CmsBlogPost } from "@/lib/sample-data";
import { getLocaleByCode, getLocaleByPathSegment, getLocalePath, type LocaleCode, type LocalePathSegment, LOCALES } from "@/lib/utils";

const postThumbnails: Record<string, string> = {
  "dji-osmo-pocket-3-vs-creator-combo-malaysia": "/blog-thumbnails/dji-osmo-pocket-3-vs-creator-combo.png",
  "eastel-vs-beone-vs-halo-prepaid-sim-malaysia": "/blog-thumbnails/eastel-vs-beone-vs-halo.png",
  "hot-weather-commute-comparison-malaysia": "/blog-thumbnails/hot-weather-commute-comparison.png",
  "hot-weather-commute-bundle-malaysia": "/blog-thumbnails/hot-weather-commute-bundle.png",
  "hot-weather-commute-checklist-malaysia": "/blog-thumbnails/hot-weather-commute-checklist.png",
  "campus-days-guide-malaysia": "/blog-thumbnails/campus-days-guide.png",
  "campus-days-comparison-malaysia": "/blog-thumbnails/campus-days-comparison.png",
  "campus-days-bundle-malaysia": "/blog-thumbnails/campus-days-bundle.png",
  "campus-days-checklist-malaysia": "/blog-thumbnails/campus-days-checklist.png",
  "weekend-city-trip-comparison-malaysia": "/blog-thumbnails/weekend-city-trip-comparison.png",
};

const fallbackCovers = {
  motorcycle: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  data: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  gear: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
};

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

export function getPostCoverImage(post: CmsBlogPost, localeCode: LocaleCode) {
  const translation = resolveTranslationForLocale(post, localeCode);
  if (postThumbnails[post.slug]) return postThumbnails[post.slug];
  if (translation.heroImageUrl) return translation.heroImageUrl;

  if (/motorcycle|delivery-rider/.test(post.slug)) return fallbackCovers.motorcycle;
  if (/travel|trip|airport|creator/.test(post.slug)) return fallbackCovers.travel;
  if (/sim|data|hotspot/.test(post.slug)) return fallbackCovers.data;
  return fallbackCovers.gear;
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
