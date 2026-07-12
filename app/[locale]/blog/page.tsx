import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPostsForAdmin } from "@/lib/db";
import { buildLocaleMetadata } from "@/lib/locale-metadata";
import { getLocaleByPathSegment, getLocalePath, type LocaleCode } from "@/lib/utils";
import { getPostCoverImage, resolveTranslationForLocale } from "@/lib/public-blog";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

const copy: Record<string, {
  title: string;
  intro: string;
  latest: string;
  approachTitle: string;
  approach: string[];
  coverageTitle: string;
  coverage: string[];
  topicsTitle: string;
  topicsIntro: string;
  minRead: string;
  empty: string;
}> = {
  en: {
    title: "Malaysia tech comparisons and buying guides",
    intro: "Independent research to help you choose technology, mobile plans, and creator gear with confidence.",
    latest: "Latest product comparisons",
    approachTitle: "Practical buying advice for Malaysia",
    approach: [
      "Launcher turns complicated product choices into clear, useful comparisons. Each guide explains the meaningful differences, who each option suits, and where a cheaper choice may be enough. We focus on details that affect Malaysian buyers, including local availability, current merchant pricing, mobile network terms, warranty context, and the real cost of bundled accessories.",
      "Our recommendations are based on documented specifications, official policies, and clearly identified merchant information. We do not claim hands-on testing unless it actually took place, and we separate verified facts from editorial analysis. Prices and plan terms are dated because they can change.",
    ],
    coverageTitle: "What our guides cover",
    coverage: [
      "Current guides compare creator cameras and prepaid SIM plans, with more Malaysia-focused technology categories planned. You can use them to understand tradeoffs before visiting a merchant, rather than relying on a product title or discount alone.",
      "Some links are affiliate links, which may earn Launcher a commission without changing your price. Commercial relationships do not determine our conclusions, and every guide includes a clear disclosure.",
    ],
    topicsTitle: "Explore by decision topic",
    topicsIntro: "Start with a topic cluster when you want to compare related guides before choosing a product or plan.",
    minRead: "min read",
    empty: "No cubes launched yet.",
  },
  my: {
    title: "Perbandingan teknologi dan panduan membeli Malaysia",
    intro: "Kajian bebas untuk membantu anda memilih teknologi, pelan mudah alih dan peralatan pencipta dengan yakin.",
    latest: "Perbandingan produk terkini",
    approachTitle: "Nasihat pembelian praktikal untuk Malaysia",
    approach: [
      "Launcher menukar pilihan produk yang rumit kepada perbandingan yang jelas dan berguna. Setiap panduan menerangkan perbezaan penting, pengguna yang sesuai bagi setiap pilihan dan keadaan apabila pilihan lebih murah sudah memadai. Kami memberi tumpuan pada perkara yang mempengaruhi pembeli Malaysia, termasuk ketersediaan tempatan, harga semasa peniaga, terma rangkaian mudah alih, waranti dan kos sebenar aksesori dalam pakej.",
      "Cadangan kami berdasarkan spesifikasi yang didokumenkan, polisi rasmi dan maklumat peniaga yang dikenal pasti dengan jelas. Kami tidak mendakwa telah menguji produk sendiri melainkan ujian itu benar-benar dilakukan, dan kami membezakan fakta yang disahkan daripada analisis editorial. Harga dan terma pelan disertakan tarikh kerana maklumat tersebut boleh berubah.",
    ],
    coverageTitle: "Perkara yang diliputi panduan kami",
    coverage: [
      "Panduan semasa membandingkan kamera pencipta dan pelan SIM prabayar, dengan lebih banyak kategori teknologi berfokuskan Malaysia akan datang. Gunakannya untuk memahami pertimbangan sebelum melawat peniaga, bukan bergantung pada tajuk produk atau diskaun semata-mata.",
      "Sesetengah pautan ialah pautan ahli gabungan yang mungkin memberi Launcher komisen tanpa mengubah harga anda. Hubungan komersial tidak menentukan kesimpulan kami dan setiap panduan mempunyai pendedahan yang jelas.",
    ],
    topicsTitle: "Teroka mengikut topik keputusan",
    topicsIntro: "Mulakan dengan kelompok topik untuk membandingkan panduan berkaitan sebelum memilih produk atau pelan.",
    minRead: "min bacaan",
    empty: "Belum ada cube dilancarkan.",
  },
  zh: {
    title: "马来西亚科技产品比较与购买指南",
    intro: "通过独立研究，帮助你更有信心地选择科技产品、移动配套与创作者设备。",
    latest: "最新产品比较",
    approachTitle: "面向马来西亚买家的实用建议",
    approach: [
      "Launcher 把复杂的产品选择整理成清晰、实用的比较。每篇指南都会说明真正重要的差异、各选项适合哪些用户，以及较便宜的选择在什么情况下已经足够。我们重点关注影响马来西亚买家的信息，包括本地供货、商家现价、移动网络条款、保修情况和套装配件的实际成本。",
      "我们的建议以公开规格、官方政策和明确标注的商家资料为依据。除非确实进行了实测，否则不会声称亲自测试过产品；我们也会区分可验证的事实与编辑分析。由于价格和配套条款可能变化，相关资料都会注明核实日期。",
    ],
    coverageTitle: "我们的指南涵盖什么",
    coverage: [
      "目前的指南涵盖创作者相机与预付 SIM 配套，未来将加入更多以马来西亚为重点的科技类别。你可以在前往商家购买前先了解各种取舍，而不是只根据商品标题或折扣作决定。",
      "部分链接属于联盟链接，Launcher 可能获得佣金，但不会增加你的购买价格。商业合作不会决定我们的结论，每篇指南也会提供清楚的联盟披露。",
    ],
    topicsTitle: "按决策主题浏览",
    topicsIntro: "若想在选择产品或配套前比较相关指南，可先从同一主题的内容开始。",
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
  const topicGroups = Object.values(
    publishedPosts.reduce<Record<string, typeof publishedPosts>>((groups, post) => {
      const category = post.pageConfig.category;
      groups[category] ??= [];
      groups[category].push(post);
      return groups;
    }, {}),
  ).filter((group) => group.length > 1);
  const siteUrl = getSiteUrl();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/${locale}/blog#collection`,
    url: `${siteUrl}/${locale}/blog`,
    name: pageCopy.title,
    description: pageCopy.intro,
    inLanguage: localeConfig.htmlLang,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: publishedPosts.map((post, index) => {
        const translation = resolveTranslationForLocale(post, localeCode);
        return {
          "@type": "ListItem",
          position: index + 1,
          name: translation.title,
          url: absoluteUrl(getLocalePath(localeCode, translation.slug)),
        };
      }),
    },
  };

  return (
    <section className="launcher-frame px-4 pb-14 pt-5 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mb-6">
        <h1 className="text-[2.15rem] font-medium leading-tight text-black sm:text-[2.8rem]">
          {pageCopy.title}
        </h1>
        <p className="mt-1.5 text-[1rem] leading-snug text-neutral-500 sm:text-[1.1rem]">{pageCopy.intro}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-medium text-black sm:text-2xl">{pageCopy.latest}</h2>
        {publishedPosts.map((post, index) => {
            const translation = resolveTranslationForLocale(post, localeCode);
            const readMinutes = Math.max(4, Math.ceil((translation.body?.length ?? 0) / 850));
            return (
              <article key={post.id}>
                <Link
                  className="grid grid-cols-[1.45rem_8rem_minmax(0,1fr)] items-center gap-3 text-black no-underline sm:grid-cols-[1.8rem_12rem_minmax(0,1fr)] sm:gap-5"
                  href={getLocalePath(localeCode, translation.slug) as any}
                >
                  <span className="text-[1.35rem] font-normal sm:text-[1.65rem]">{index + 1}</span>
                  <img
                    src={getPostCoverImage(post, localeCode)}
                    alt={`${translation.title} guide illustration`}
                    className="aspect-square w-full rounded-lg bg-neutral-50 object-contain"
                    loading={index < 4 ? "eager" : "lazy"}
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
            <Image src="/cube-frame.png" alt="Empty Launcher guide collection" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
            <p className="mt-4 text-lg font-normal text-black">{pageCopy.empty}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-14 grid gap-10 border-t border-neutral-200 pt-10 text-[0.98rem] leading-7 text-neutral-700 sm:grid-cols-2 sm:text-base">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-medium leading-tight text-black [&::-webkit-details-marker]:hidden sm:text-2xl">
            {pageCopy.approachTitle}
            <span aria-hidden="true" className="text-2xl font-normal transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 space-y-4">
            {pageCopy.approach.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </details>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-medium leading-tight text-black [&::-webkit-details-marker]:hidden sm:text-2xl">
            {pageCopy.coverageTitle}
            <span aria-hidden="true" className="text-2xl font-normal transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 space-y-4">
            {pageCopy.coverage.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </details>
      </div>

      {!query && topicGroups.length > 0 ? (
        <section className="mt-14 border-t border-neutral-200 pt-10" aria-labelledby="decision-topics">
          <h2 id="decision-topics" className="text-xl font-medium text-black sm:text-2xl">{pageCopy.topicsTitle}</h2>
          <p className="mt-2 max-w-2xl text-[0.98rem] leading-7 text-neutral-600">{pageCopy.topicsIntro}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {topicGroups.map((group) => (
              <section key={group[0].pageConfig.category} className="rounded-[1.1rem] border border-neutral-200 p-5">
                <h3 className="text-[1.05rem] font-medium text-black">{group[0].pageConfig.category}</h3>
                <ul className="mt-3 space-y-2">
                  {group.map((post) => {
                    const translation = resolveTranslationForLocale(post, localeCode);
                    return (
                      <li key={post.id}>
                        <Link className="text-sm leading-snug text-neutral-700 underline underline-offset-4 hover:text-black" href={getLocalePath(localeCode, translation.slug) as any}>
                          {translation.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
