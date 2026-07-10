import { notFound, redirect } from "next/navigation";
import { getPostByIdOrSlug } from "@/lib/db";
import { getLocalePath } from "@/lib/utils";

export default async function LegacyBlogPostRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostByIdOrSlug(slug);

  if (!post) {
    notFound();
  }

  const matchedTranslation = post.translations.find((item) => item.slug === slug);

  if (matchedTranslation) {
    redirect(getLocalePath(matchedTranslation.locale, matchedTranslation.slug) as any);
  }

  const fallback = post.translations.find((item) => item.locale === "en") || post.translations[0];
  redirect(getLocalePath(fallback.locale, fallback.slug) as any);
}
