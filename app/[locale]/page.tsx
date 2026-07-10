import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildLocaleMetadata } from "@/lib/locale-metadata";
import { getLocaleByPathSegment, getLocalePath } from "@/lib/utils";

const copy = {
  en: {
    kicker: "Localized public routes",
    title: "Launcher affiliate pages",
    body: "Browse the multilingual public rollout using explicit locale paths. English, Bahasa Malaysia, and Simplified Chinese now each live on their own URL tree.",
    blogCta: "Open blog index",
    adminCta: "Open admin",
  },
  my: {
    kicker: "Laluan awam setempat",
    title: "Halaman affiliate Launcher",
    body: "Lihat rollout awam berbilang bahasa menggunakan laluan locale yang jelas. English, Bahasa Malaysia, dan 简体中文 kini ada pada struktur URL masing-masing.",
    blogCta: "Buka indeks blog",
    adminCta: "Buka admin",
  },
  zh: {
    kicker: "本地化公开路由",
    title: "Launcher 联盟页面",
    body: "通过明确的语言路径浏览多语言公开页面。English、Bahasa Malaysia 与简体中文现在各自拥有独立 URL 结构。",
    blogCta: "打开博客索引",
    adminCta: "打开后台",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  return localeConfig ? buildLocaleMetadata(localeConfig.code, "home") : {};
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);

  if (!localeConfig) {
    notFound();
  }

  const pageCopy = copy[locale as keyof typeof copy];

  return (
    <section className="launcher-frame px-6 py-12 sm:px-8">
      <div>
        <p className="text-xs uppercase text-neutral-500">{pageCopy.kicker}</p>
        <h1 className="mt-4 text-5xl font-medium leading-tight text-black">{pageCopy.title}</h1>
        <p className="mt-6 text-xl leading-relaxed text-neutral-600">{pageCopy.body}</p>
        <div className="mt-10 flex flex-wrap gap-4 text-base font-normal">
          <Link className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-white no-underline" href={(getLocalePath(localeConfig.code, undefined) + "/blog") as any}>
            {pageCopy.blogCta}
            <ArrowRight className="ml-3" size={18} weight="regular" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
