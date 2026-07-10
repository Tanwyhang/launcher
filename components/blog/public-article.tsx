import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import type { AffiliateLinkDraft, CmsBlogPost } from "@/lib/sample-data";
import { MarkdownArticle } from "@/components/markdown-article";
import { resolveTranslationForLocale } from "@/lib/public-blog";
import { SEO_EXPERIMENTS, getSeoExperimentVariant } from "@/lib/seo-experiments";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import type { LocaleCode } from "@/lib/utils";
import { getLocalePath, LOCALES } from "@/lib/utils";

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

function pickCta(locale: LocaleCode, link: { ctaTextEn: string; ctaTextMs: string; ctaTextZhHans: string }) {
  if (locale === "ms") return link.ctaTextMs;
  if (locale === "zh-Hans") return link.ctaTextZhHans;
  return link.ctaTextEn;
}

function localizeOffer(offer: AffiliateLinkDraft, locale: LocaleCode): AffiliateLinkDraft {
  const localized = offer.localizedContent?.[locale];
  return localized ? { ...offer, ...localized } : offer;
}

function localizeLabels(locale: LocaleCode) {
  if (locale === "ms") {
    return {
      allPosts: "Semua post",
      affiliatePick: "Pilihan editorial",
      comparison: "Perbandingan ringkas",
      bestOverall: "Pilihan utama",
      quickAnswer: "Jawapan ringkas",
      bestFor: "Sesuai untuk",
      notFor: "Kurang sesuai untuk",
      pricing: "Format dan akses",
      pros: "Kelebihan",
      cons: "Kekurangan",
      alternatives: "Alternatif untuk dipertimbangkan",
      faq: "Soalan lazim",
      disclosure: "Pendedahan",
      updated: "Dikemas kini",
      recommendedPicks: "Senarai pendek editorial",
      topPicksTitle: "Pilihan untuk dibandingkan",
      minRead: "min bacaan",
      product: "Produk",
      price: "Format",
      takeaways: "Perkara utama",
      sources: "Sumber rasmi disemak",
      disclosureText: "Pautan di halaman ini pergi terus ke laman rasmi. launcher tidak menerima komisen daripada pautan ini pada masa penerbitan.",
    };
  }

  if (locale === "zh-Hans") {
    return {
      allPosts: "所有文章",
      affiliatePick: "编辑选择",
      comparison: "快速比较",
      bestOverall: "首选推荐",
      quickAnswer: "先看结论",
      bestFor: "最适合",
      notFor: "不太适合",
      pricing: "形式与获取方式",
      pros: "优点",
      cons: "缺点",
      alternatives: "可考虑的替代方案",
      faq: "常见问题",
      disclosure: "披露说明",
      updated: "更新于",
      recommendedPicks: "编辑短名单",
      topPicksTitle: "值得比较的选择",
      minRead: "分钟阅读",
      product: "产品",
      price: "形式",
      takeaways: "重点结论",
      sources: "已核对的官方来源",
      disclosureText: "本页链接直接指向官方站点。发布时，launcher 不会从这些链接获得佣金。",
    };
  }

  return {
    allPosts: "All posts",
    affiliatePick: "Editorial option",
    comparison: "Comparison",
    bestOverall: "Best overall pick",
    quickAnswer: "Quick answer",
    bestFor: "Best for",
    notFor: "Not ideal for",
    pricing: "Format and access",
    pros: "Pros",
    cons: "Cons",
    alternatives: "Alternatives to consider",
    faq: "FAQ",
    disclosure: "Disclosure",
    updated: "Updated",
    recommendedPicks: "Editorial shortlist",
    topPicksTitle: "Options to compare",
    minRead: "min read",
    product: "Product",
    price: "Format",
    takeaways: "Key takeaways",
    sources: "Official sources checked",
    disclosureText: "Links on this page go directly to official product sites. launcher did not earn a commission from these links at publication time.",
  };
}

function getDateLocale(locale: LocaleCode) {
  if (locale === "ms") return "ms-MY";
  if (locale === "zh-Hans") return "zh-CN";
  return "en";
}

function estimateReadMinutes(text: string) {
  return Math.max(4, Math.ceil(text.split(/\s+/).filter(Boolean).length / 180));
}

function cleanSectionBody(title: string, body: string) {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedBody = body.trim();

  if (normalizedBody.toLowerCase().startsWith(normalizedTitle)) {
    return normalizedBody.slice(title.trim().length).replace(/^[:\s.-]+/, "");
  }

  return normalizedBody;
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

type Props = {
  post: CmsBlogPost;
  localeCode: LocaleCode;
};

export function PublicArticle({ post, localeCode }: Props) {
  const translation = resolveTranslationForLocale(post, localeCode);
  const activeOffers = post.affiliateLinks.filter((item) => item.isActive).map((item) => localizeOffer(item, localeCode));
  const leadOffer = activeOffers[0] ?? null;
  const alternativeOffers = activeOffers.slice(1);
  const labels = localizeLabels(localeCode);
  const localeSegment = LOCALES.find((locale) => locale.code === localeCode)?.pathSegment ?? "en";
  const htmlLang = LOCALES.find((locale) => locale.code === localeCode)?.htmlLang ?? "en";
  const readMinutes = estimateReadMinutes(`${translation.body} ${translation.sections.map((section) => section.sectionBody).join(" ")}`);
  const activeExperiment = SEO_EXPERIMENTS[0];
  const activeVariant = getSeoExperimentVariant(activeExperiment.key);
  const pageUrl = absoluteUrl(getLocalePath(localeCode, translation.slug));
  const siteUrl = getSiteUrl();
  const socialImage = absoluteUrl(`${getLocalePath(localeCode, translation.slug)}/opengraph-image`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      url: pageUrl,
      headline: translation.title,
      description: translation.metaDescription,
      inLanguage: htmlLang,
      datePublished: post.updatedAt,
      dateModified: post.updatedAt,
      author: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      image: { "@type": "ImageObject", url: socialImage, width: 1200, height: 630 },
      about: [post.pageConfig.category, post.pageConfig.useCase, post.pageConfig.market],
      keywords: [post.pageConfig.primaryKeyword, post.pageConfig.category, post.pageConfig.market].filter(Boolean),
      },
      {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: translation.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
      },
      {
      "@type": "ItemList",
      "@id": `${pageUrl}#shortlist`,
      itemListElement: activeOffers.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: item.anchorText,
          description: item.summary,
          url: item.destinationUrl,
        },
      })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "launcher", item: absoluteUrl(`/${localeSegment}`) },
          { "@type": "ListItem", position: 2, name: labels.allPosts, item: absoluteUrl(`/${localeSegment}/blog`) },
          { "@type": "ListItem", position: 3, name: translation.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <article
      className="launcher-frame px-4 pb-16 pt-5 sm:px-6"
      data-analytics-event={ANALYTICS_EVENTS.articleView}
      data-experiment-key={activeExperiment.key}
      data-experiment-variant={activeVariant.key}
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <header>
        <Link href={`/${localeSegment}/blog`} className="inline-flex items-center gap-3 text-[1.05rem] font-normal text-neutral-600 no-underline hover:text-black">
          <ArrowLeft size={20} weight="regular" aria-hidden="true" />
          {labels.allPosts}
        </Link>

        <div className="mt-6 flex items-center gap-3 text-[0.9rem] text-neutral-500">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-black">{post.pageConfig.category}</span>
          <span>{readMinutes} {labels.minRead}</span>
        </div>

        <h1 className="mt-5 text-[2.2rem] font-medium leading-tight text-black sm:text-[3.2rem]">
          {translation.title}
        </h1>

        <div className="mt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black p-2 text-lg font-medium text-white">
              <img src="/logo.png" alt="" className="h-full w-full object-contain invert" />
            </div>
            <div>
              <p className="text-[1rem] font-medium text-black">launcher</p>
              <p className="mt-0.5 text-[0.95rem] text-neutral-500">
                {labels.updated} {new Date(post.updatedAt).toLocaleDateString(getDateLocale(localeCode), { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <figure className="launcher-hero-plate relative mt-6 h-[15rem] overflow-hidden rounded-[1.15rem] border border-black/5 sm:h-[20rem]">
        <img src="/cube-square.png" alt="" className="absolute bottom-4 left-[12%] w-[34%]" />
        <img src="/cube-launcher-mark.png" alt="" className="absolute bottom-5 left-[34%] w-[38%]" />
        <img src="/cube-pair.png" alt="" className="absolute right-[10%] top-[8%] w-[28%]" />
        <figcaption className="sr-only">{translation.title}</figcaption>
      </figure>

      <div className="mt-6">
        <p className="text-[1.05rem] leading-relaxed text-black sm:text-[1.12rem]">
          {translation.metaDescription}
        </p>

        <div className="mt-8 rounded-[1.15rem] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-medium uppercase text-neutral-500">{labels.quickAnswer}</p>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-black">
            {translation.quickAnswer}
          </p>
        </div>

        <section className="mt-8 rounded-[1.15rem] bg-neutral-50 p-5" aria-labelledby="key-takeaways">
          <h2 id="key-takeaways" className="text-sm font-medium uppercase text-neutral-500">{labels.takeaways}</h2>
          <ul className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-neutral-800">
            {translation.keyTakeaways.map((item) => <li key={item} className="ml-5 list-disc pl-1">{item}</li>)}
          </ul>
        </section>

        {activeOffers.length > 0 ? (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-sm font-medium uppercase text-neutral-500">{labels.recommendedPicks}</p>
              <h2 className="mt-2 text-[1.55rem] font-medium leading-tight text-black sm:text-[1.8rem]">
                {labels.topPicksTitle}
              </h2>
            </div>
            <div className="grid gap-4">
              {activeOffers.map((item, index) => (
                <a
                  key={item.id}
                  href={item.trackingUrl || item.destinationUrl}
                  target="_blank"
                  rel={item.rel}
                  className="rounded-[1.2rem] border border-neutral-200 bg-white p-5 text-black no-underline"
                  data-analytics-event={ANALYTICS_EVENTS.affiliateCardClick}
                  data-page-id={post.id}
                  data-locale={localeCode}
                  data-offer-id={item.id}
                  data-offer-position={index + 1}
                >
                  <div className="flex gap-4">
                    <img src={cubeAssets[index % cubeAssets.length]} alt="" className="h-16 w-16 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <span>{labels.affiliatePick}</span>
                        <span aria-hidden="true">.</span>
                        <span>{item.priceBand}</span>
                      </div>
                      <h3 className="mt-2 text-[1.18rem] font-medium leading-snug text-black">{item.anchorText}</h3>
                      <p className="mt-2 text-[0.98rem] leading-relaxed text-neutral-700">{item.summary}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-neutral-500">{item.bestFor}</span>
                        <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                          {pickCta(localeCode, item)}
                          <ArrowRight className="ml-2" size={16} weight="regular" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {activeOffers.length > 0 ? <section className="mt-10 pt-2" data-analytics-event={ANALYTICS_EVENTS.comparisonTableView} data-page-id={post.id} data-locale={localeCode}>
          <h2 className="text-[1.55rem] font-medium leading-tight text-black sm:text-[1.8rem]">{labels.comparison}</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-base text-neutral-700">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                  <th className="py-3 pr-6">{labels.product}</th>
                  <th className="py-3 pr-6">{labels.bestFor}</th>
                  <th className="py-3 pr-6">{labels.price}</th>
                </tr>
              </thead>
              <tbody>
                {activeOffers.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 align-top">
                    <td className="py-4 pr-6 font-medium text-black">{item.anchorText}</td>
                    <td className="py-4 pr-6">{item.bestFor}</td>
                    <td className="py-4 pr-6">{item.priceBand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section> : null}

        {leadOffer ? (
          <section className="mt-10 pt-2">
            <p className="text-xs font-medium uppercase text-neutral-500">
              {labels.bestOverall}
            </p>
            <h2 className="mt-3 text-[1.65rem] font-medium leading-tight text-black sm:text-[1.9rem]">{leadOffer.anchorText}</h2>
            <p className="mt-2 text-base text-neutral-500">{leadOffer.merchantName}</p>
            <p className="mt-6 text-[1.08rem] leading-relaxed text-neutral-800">{leadOffer.summary}</p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium uppercase text-neutral-500">{labels.bestFor}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-800">{leadOffer.bestFor}</p>

                <h3 className="mt-8 text-sm font-medium uppercase text-neutral-500">{labels.notFor}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-800">{leadOffer.notFor}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase text-neutral-500">{labels.pricing}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-800">{leadOffer.pricingSummary}</p>
                <a
                  href={leadOffer.trackingUrl || leadOffer.destinationUrl}
                  target="_blank"
                  rel={leadOffer.rel}
                  className="mt-6 inline-flex items-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white no-underline"
                  data-analytics-event={ANALYTICS_EVENTS.leadOfferClick}
                  data-page-id={post.id}
                  data-locale={localeCode}
                  data-offer-id={leadOffer.id}
                  data-experiment-key={activeExperiment.key}
                  data-experiment-variant={activeVariant.key}
                >
                  {pickCta(localeCode, leadOffer)}
                  <ArrowRight className="ml-4" size={20} weight="regular" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium uppercase text-neutral-500">{labels.pros}</h3>
                <ul className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-neutral-800">
                  {leadOffer.pros.map((item, index) => (
                    <li key={index} className="ml-5 list-disc pl-1">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium uppercase text-neutral-500">{labels.cons}</h3>
                <ul className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-neutral-800">
                  {leadOffer.cons.map((item, index) => (
                    <li key={index} className="ml-5 list-disc pl-1">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10 pt-2">
          <MarkdownArticle markdown={translation.body} />
        </section>

        {activeOffers.length > 0 ? (
          <section className="mt-10 pt-2">
            <h2 className="text-[1.4rem] font-medium text-black">{labels.sources}</h2>
            <ul className="mt-4 space-y-3 text-base">
              {activeOffers.map((item) => (
                <li key={item.id}>
                  <a className="text-black underline underline-offset-4" href={item.destinationUrl} target="_blank" rel="noopener noreferrer">
                    {item.merchantName}: {item.anchorText}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {translation.sections.map((section, index) => {
          const sectionBody = cleanSectionBody(section.sectionTitle, section.sectionBody);

          return (
            <section key={section.id} className="mt-10 pt-2">
              {section.sectionImageUrl ? (
                <img
                  src={cubeAssets[(index + 2) % cubeAssets.length]}
                  alt={section.sectionTitle}
                  className="mx-auto mb-6 h-44 w-44 object-contain"
                />
              ) : null}
              <h2 className="text-[1.55rem] font-medium leading-tight text-black sm:text-[1.8rem]">{section.sectionTitle}</h2>
              {sectionBody ? <p className="mt-5 text-[1.08rem] leading-relaxed text-neutral-800">{sectionBody}</p> : null}
            </section>
          );
        })}

        {alternativeOffers.length > 0 ? (
          <section className="mt-10 pt-2">
            <h2 className="text-[1.55rem] font-medium leading-tight text-black sm:text-[1.8rem]">{labels.alternatives}</h2>
            <ol className="mt-6 space-y-4">
              {alternativeOffers.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={item.trackingUrl || item.destinationUrl}
                    target="_blank"
                    rel={item.rel}
                    className="block rounded-[1.2rem] border border-neutral-200 bg-white p-5 text-black no-underline"
                    data-analytics-event={ANALYTICS_EVENTS.affiliateAlternativeClick}
                    data-page-id={post.id}
                    data-locale={localeCode}
                    data-offer-id={item.id}
                    data-offer-position={index + 2}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-medium text-white">
                        {item.merchantName.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-neutral-500">{labels.affiliatePick}</p>
                        <h3 className="mt-1 text-[1.2rem] font-medium leading-snug text-black">{item.anchorText}</h3>
                        <p className="mt-2 text-[0.98rem] leading-relaxed text-neutral-700">{item.summary}</p>
                        <div className="mt-4 grid gap-3 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700 sm:grid-cols-2">
                          <p>
                            <span className="block text-neutral-500">{labels.bestFor}</span>
                            <span className="text-black">{item.bestFor}</span>
                          </p>
                          <p>
                            <span className="block text-neutral-500">{labels.pricing}</span>
                            <span className="text-black">{item.priceBand}</span>
                          </p>
                        </div>
                        <span className="mt-4 inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                          {pickCta(localeCode, item)}
                          <ArrowRight className="ml-2" size={16} weight="regular" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-10 pt-2">
          <h2 className="text-[1.55rem] font-medium leading-tight text-black sm:text-[1.8rem]">{labels.faq}</h2>
          <div className="mt-6 space-y-8">
            {translation.faqItems.map((item) => (
              <div key={item.id}>
                <h3 className="text-xl font-medium text-black">{item.question}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-800">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="mt-10 pt-2 text-sm leading-6 text-neutral-500">
          <p className="text-xs font-medium uppercase text-neutral-500">{labels.disclosure}</p>
          <p className="mt-3">{labels.disclosureText}</p>
        </aside>
      </div>

    </article>
  );
}
