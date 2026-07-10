import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublicArticle } from "@/components/blog/public-article";
import { getPostByIdOrSlug, listPostsForAdmin } from "@/lib/db";
import { getOpenGraphLocale } from "@/lib/locale-metadata";
import { buildLanguageAlternates, resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";
import { getLocaleByCode, getLocalePath, LOCALES } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const localeCode = resolveLocaleCodeFromSegment(locale);

  if (!localeCode) {
    return {};
  }

  const post = await getPostByIdOrSlug(slug);

  if (!post || post.status !== "published") {
    return {};
  }

  const translation = resolveTranslationForLocale(post, localeCode);
  const languages = buildLanguageAlternates(post);
  const canonical = getLocalePath(localeCode, translation.slug);
  const socialImage = `${canonical}/opengraph-image`;
  const ogLocale = getOpenGraphLocale(localeCode);

  return {
    title: translation.metaTitle,
    description: translation.metaDescription,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "article",
      siteName: "launcher",
      title: translation.metaTitle,
      description: translation.metaDescription,
      url: canonical,
      locale: ogLocale,
      alternateLocale: LOCALES.map((item) => getOpenGraphLocale(item.code)).filter((item) => item !== ogLocale),
      publishedTime: post.updatedAt,
      modifiedTime: post.updatedAt,
      authors: ["launcher"],
      images: [{ url: socialImage, width: 1200, height: 630, alt: translation.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: translation.metaTitle,
      description: translation.metaDescription,
      images: [socialImage],
    },
  };
}

export default async function LocalizedBlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const localeCode = resolveLocaleCodeFromSegment(locale);

  if (!localeCode) {
    notFound();
  }

  const post = await getPostByIdOrSlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const translation = resolveTranslationForLocale(post, localeCode);

  if (translation.slug !== slug) {
    redirect(getLocalePath(localeCode, translation.slug) as any);
  }

  return <PublicArticle post={post} localeCode={localeCode} />;
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = (await listPostsForAdmin()).filter((post) => post.status === "published");

  return posts.flatMap((post) =>
    LOCALES.map((locale) => {
      const translation = resolveTranslationForLocale(post, locale.code);
      return {
        locale: getLocaleByCode(locale.code).pathSegment,
        slug: translation.slug,
      };
    }),
  );
}
