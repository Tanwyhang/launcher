import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPostsForAdmin } from "@/lib/db";
import { buildLocaleMetadata } from "@/lib/locale-metadata";
import { getLocaleByPathSegment, getLocalePath, type LocaleCode } from "@/lib/utils";
import { resolveTranslationForLocale } from "@/lib/public-blog";

const cubeAssets = [
  "/cube-launcher-mark.png",
  "/cube-slash.png",
  "/cube-square.png",
  "/cube-triangle.png",
  "/cube-steps.png",
  "/cube-plus.png",
  "/cube-pair.png",
  "/cube-frame.png",
];

const copy: Record<string, { title: string; intro: string; minRead: string; empty: string }> = {
  en: {
    title: "Explore cubes",
    intro: "Cubes = Knowledge",
    minRead: "min read",
    empty: "No cubes launched yet.",
  },
  my: {
    title: "Teroka cubes",
    intro: "Cubes = Pengetahuan",
    minRead: "min bacaan",
    empty: "Belum ada cube dilancarkan.",
  },
  zh: {
    title: "探索 cubes",
    intro: "Cubes = 知识",
    minRead: "分钟阅读",
    empty: "还没有发布 cube。",
  },
};

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  return localeConfig ? buildLocaleMetadata(localeConfig.code, "blog") : {};
}

export default async function LocalizedBlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const localeConfig = getLocaleByPathSegment(locale);

  if (!localeConfig) {
    notFound();
  }

  const posts = await listPostsForAdmin();
  const localeCode = localeConfig.code as LocaleCode;
  const pageCopy = copy[locale] ?? copy.en;
  const query = q.trim().toLocaleLowerCase();
  const publishedPosts = posts.filter((post) => {
    if (post.status !== "published") return false;
    if (!query) return true;
    const translation = resolveTranslationForLocale(post, localeCode);
    return `${translation.title} ${translation.metaDescription} ${post.pageConfig.category}`.toLocaleLowerCase().includes(query);
  });

  return (
    <section className="launcher-frame px-4 pb-14 pt-5 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[2.15rem] font-medium leading-tight text-black sm:text-[2.8rem]">
          {pageCopy.title}
        </h1>
        <p className="mt-1.5 text-[1rem] leading-snug text-neutral-500 sm:text-[1.1rem]">{pageCopy.intro}</p>
      </div>

      <div className="space-y-6">
        {publishedPosts.map((post, index) => {
            const translation = resolveTranslationForLocale(post, localeCode);
            const readMinutes = Math.max(4, Math.ceil((translation.body?.length ?? 0) / 850));
            return (
              <article key={post.id}>
                <Link
                  className="grid grid-cols-[1.45rem_5.9rem_minmax(0,1fr)] items-center gap-3 text-black no-underline sm:grid-cols-[1.8rem_7.2rem_minmax(0,1fr)] sm:gap-4"
                  href={getLocalePath(localeCode, translation.slug) as any}
                >
                  <span className="text-[1.35rem] font-normal sm:text-[1.65rem]">{index + 1}</span>
                  <img
                    src={cubeAssets[index % cubeAssets.length]}
                    alt=""
                    className="w-full object-contain"
                  />
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-medium leading-snug sm:text-[1.18rem]">
                      {translation.title}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.82rem] leading-snug text-neutral-500 sm:text-[0.9rem]">
                      <span className="max-w-[7rem] truncate sm:max-w-none">{post.pageConfig.category}</span>
                      <span aria-hidden="true">.</span>
                      <span>{readMinutes} {pageCopy.minRead}</span>
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}

        {publishedPosts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-neutral-200 p-8 text-center">
            <img src="/cube-frame.png" alt="" className="mx-auto h-28 w-28 object-contain" />
            <p className="mt-4 text-lg font-normal text-black">{pageCopy.empty}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
