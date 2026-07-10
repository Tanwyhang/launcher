import type { MetadataRoute } from "next";
import { listPostsForAdmin } from "@/lib/db";
import { resolveTranslationForLocale } from "@/lib/public-blog";
import { absoluteUrl } from "@/lib/site";
import { getLocalePath, LOCALES } from "@/lib/utils";

export const revalidate = 3600;

function localizedLanguages(pathBuilder: (locale: (typeof LOCALES)[number]) => string) {
  const entries = Object.fromEntries(LOCALES.map((locale) => [locale.htmlLang, absoluteUrl(pathBuilder(locale))]));
  return { ...entries, "x-default": absoluteUrl(pathBuilder(LOCALES[0])) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await listPostsForAdmin()).filter((post) => post.status === "published");
  const routes: MetadataRoute.Sitemap = [
    ...LOCALES.map((locale) => ({
      url: absoluteUrl(`${getLocalePath(locale.code)}/blog`),
      changeFrequency: "daily" as const,
      priority: 0.8,
      alternates: {
        languages: localizedLanguages((item) => `${getLocalePath(item.code)}/blog`),
      },
    })),
    ...["about", "editorial-policy"].flatMap((page) =>
      LOCALES.map((locale) => ({
        url: absoluteUrl(`${getLocalePath(locale.code)}/${page}`),
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: {
          languages: localizedLanguages((item) => `${getLocalePath(item.code)}/${page}`),
        },
      })),
    ),
  ];

  for (const post of posts) {
    const languages = localizedLanguages((locale) => {
      const translation = resolveTranslationForLocale(post, locale.code);
      return getLocalePath(locale.code, translation.slug);
    });

    for (const locale of LOCALES) {
      const translation = resolveTranslationForLocale(post, locale.code);

      routes.push({
        url: absoluteUrl(getLocalePath(locale.code, translation.slug)),
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages,
        },
      });
    }
  }

  return routes;
}
