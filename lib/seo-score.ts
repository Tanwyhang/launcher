import type { CmsBlogPost, TranslationDraft } from "@/lib/sample-data";
import { auditPage } from "@/lib/seo-page";
import { getLocaleByCode, getLocalePath, LOCALES, type LocaleCode } from "@/lib/utils";

type ScoreState = "pass" | "warn" | "fail";

type ScoreCheck = {
  label: string;
  state: ScoreState;
  points: number;
  max: number;
  detail: string;
};

type ScoreCategory = {
  key: string;
  title: string;
  weight: number;
  score: number;
  checks: ScoreCheck[];
};

type Experiment = {
  area: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  metric: string;
};

export type SeoScoreContext = {
  siteUrl?: string;
  hasSitemap: boolean;
  hasRobots: boolean;
  hasJsonLd: boolean;
  hasMetadataBase: boolean;
  hasLocaleAlternates: boolean;
  hasLegacyRedirects: boolean;
  hasAnalyticsEvents: boolean;
  hasVariantRegistry: boolean;
  hasShareControls: boolean;
};

export type SeoScoreReport = {
  pageId: string;
  slug: string;
  locale: LocaleCode;
  url: string;
  score: number;
  grade: string;
  categories: ScoreCategory[];
  blockers: string[];
  warnings: string[];
  topActions: string[];
  experiments: Experiment[];
};

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function cjkCharacters(text: string) {
  return Array.from(text).filter((char) => /[\u3400-\u9fff]/.test(char)).length;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesKeyword(text: string, keyword: string) {
  const normalizedText = normalize(text);
  const normalizedKeyword = normalize(keyword);
  return !!normalizedKeyword && normalizedText.includes(normalizedKeyword);
}

function hasLocalizedKeywordSignal(text: string, keyword: string, locale: LocaleCode) {
  if (includesKeyword(text, keyword)) {
    return true;
  }

  const normalizedText = normalize(text);
  const lowerText = text.toLowerCase();
  const brandTokens = normalize(keyword)
    .split(" ")
    .filter((token) => token && !["alternative", "alternatives", "alternatif", "best", "for"].includes(token));
  const hasBrand = brandTokens.length > 0 && brandTokens.every((token) => normalizedText.includes(token));
  const intentTerms =
    locale === "ms"
      ? ["alternatif", "pengganti", "pilihan"]
      : locale === "zh-Hans"
        ? ["替代", "替代品", "方案", "推荐"]
        : ["alternative", "alternatives"];

  return hasBrand && intentTerms.some((term) => lowerText.includes(term) || normalizedText.includes(term));
}

function hasMarketSignal(text: string, market: string) {
  const lowerText = text.toLowerCase();

  return (
    includesKeyword(text, market) ||
    (lowerText.includes("malaysia") && (lowerText.includes("singapore") || lowerText.includes("singapura"))) ||
    (text.includes("马来西亚") && text.includes("新加坡")) ||
    text.includes("马新")
  );
}

function check(label: string, condition: boolean, points: number, detail: string, failDetail?: string): ScoreCheck {
  return {
    label,
    state: condition ? "pass" : "fail",
    points: condition ? points : 0,
    max: points,
    detail: condition ? detail : failDetail || detail,
  };
}

function rangeCheck(label: string, actual: number, min: number, max: number, points: number, unit: string) {
  const isPass = actual >= min && actual <= max;
  const isWarn = actual >= Math.floor(min * 0.75) && actual <= Math.ceil(max * 1.25);

  return {
    label,
    state: isPass ? "pass" : isWarn ? "warn" : "fail",
    points: isPass ? points : isWarn ? Math.ceil(points * 0.55) : 0,
    max: points,
    detail: `${actual}${unit}; target ${min}-${max}${unit}.`,
  } satisfies ScoreCheck;
}

function category(key: string, title: string, weight: number, checks: ScoreCheck[]): ScoreCategory {
  const max = checks.reduce((sum, item) => sum + item.max, 0);
  const points = checks.reduce((sum, item) => sum + item.points, 0);

  return {
    key,
    title,
    weight,
    score: max > 0 ? Math.round((points / max) * 100) : 0,
    checks,
  };
}

function grade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function localizedUrl(locale: LocaleCode, slug: string, siteUrl?: string) {
  const path = getLocalePath(locale, slug);
  return siteUrl ? new URL(path, siteUrl).toString() : path;
}

function buildTechnicalCategory(post: CmsBlogPost, translation: TranslationDraft, locale: LocaleCode, context: SeoScoreContext) {
  const audit = auditPage(post);
  const hasAllLocaleUrls = LOCALES.every((item) => audit.localeUrls[item.code]);
  const canonical = getLocalePath(locale, translation.slug);

  return category("technical", "Technical SEO", 18, [
    check("Published CMS status", post.status === "published", 8, "Page is published.", "Page is not published."),
    check("Canonical path", canonical === getLocalePath(locale, translation.slug), 8, `Canonical resolves to ${canonical}.`),
    check("Hreflang alternates", context.hasLocaleAlternates && hasAllLocaleUrls, 10, "All configured locales have alternate URLs.", "Missing or incomplete alternate URL coverage."),
    check("XML sitemap", context.hasSitemap, 10, "App exposes a sitemap route.", "No `app/sitemap.ts` found."),
    check("Robots route", context.hasRobots, 7, "App exposes a robots route.", "No `app/robots.ts` found."),
    check("Absolute metadata base", context.hasMetadataBase, 7, "Metadata can resolve absolute canonical and OG URLs.", "No metadataBase found in root layout."),
    check("Legacy redirects", context.hasLegacyRedirects, 5, "Legacy `/blog` paths redirect into locale-first URLs.", "Legacy blog redirects were not detected."),
  ]);
}

function contentDepthCheck(translation: TranslationDraft, bodyText: string) {
  if (translation.locale === "zh-Hans") {
    return rangeCheck("Content body depth", cjkCharacters(bodyText), 850, 2600, 8, " CJK chars");
  }

  return rangeCheck("Content body depth", words(bodyText).length, 650, 1800, 8, " words");
}

function buildOnPageCategory(translation: TranslationDraft, keyword: string) {
  const bodyText = `${translation.quickAnswer} ${translation.body} ${translation.sections.map((section) => `${section.sectionTitle} ${section.sectionBody}`).join(" ")} ${translation.faqItems.map((item) => `${item.question} ${item.answer}`).join(" ")}`;
  const titleLengthMin = translation.locale === "zh-Hans" ? 18 : 35;
  const titleLengthMax = translation.locale === "zh-Hans" ? 45 : 65;

  return category("onPage", "On-Page Relevance", 16, [
    rangeCheck("Meta title length", translation.metaTitle.length, titleLengthMin, titleLengthMax, 6, " chars"),
    rangeCheck("Meta description length", translation.metaDescription.length, translation.locale === "zh-Hans" ? 45 : 120, translation.locale === "zh-Hans" ? 95 : 165, 7, " chars"),
    check("Keyword in title", hasLocalizedKeywordSignal(`${translation.title} ${translation.metaTitle}`, keyword, translation.locale), 7, "Localized primary keyword intent appears in title metadata.", "Primary keyword intent is not visible in title metadata."),
    check("Keyword in slug", hasLocalizedKeywordSignal(translation.slug.replace(/-/g, " "), keyword, translation.locale), 5, "Localized primary keyword intent appears in slug.", "Primary keyword intent is not represented in slug."),
    check("Quick answer", translation.quickAnswer.length >= 120 || translation.locale === "zh-Hans", 5, "Direct answer block is present near the top.", "Quick answer exists but is short."),
    contentDepthCheck(translation, bodyText),
  ]);
}

function buildContentCategory(post: CmsBlogPost, translation: TranslationDraft) {
  const hasMethodology = /how we rank|how we evaluate|cara kami|bagaimana kami|我们如何|评估/.test(translation.body.toLowerCase());
  const hasMarketContext = hasMarketSignal(`${translation.metaDescription} ${translation.quickAnswer} ${translation.body}`, post.pageConfig.market);

  return category("content", "Content Moat And Intent", 18, [
    check("Search intent fit", /alternative|alternatif|替代|best|terbaik|推荐/i.test(translation.title), 7, "Title matches comparison/commercial investigation intent.", "Title does not clearly map to buyer intent."),
    check("Methodology explained", hasMethodology, 8, "Ranking method is described.", "Ranking method is thin or missing."),
    check("Three takeaways", translation.keyTakeaways.length >= 3, 5, "At least three scannable takeaways exist.", "Fewer than three takeaways."),
    check("Section depth", translation.sections.length >= 3, 6, "At least three content sections exist.", "Only two or fewer supporting sections."),
    check("FAQ coverage", translation.faqItems.length >= 3, 6, "At least three FAQ items exist.", "Only two or fewer FAQ items."),
    check("Regional buyer context", hasMarketContext, 6, "Market context is visible in page copy.", `Market context (${post.pageConfig.market}) is weak or absent in localized copy.`),
    check("Original evaluation angle", post.pageConfig.useCase.length > 8 && translation.quickAnswer.length > 80, 5, "Page evaluates a specific switching reason/use case.", "Use-case evaluation is too generic."),
  ]);
}

function buildAffiliateCategory(post: CmsBlogPost) {
  const activeOffers = post.affiliateLinks.filter((item) => item.isActive);
  const compliantLinks = activeOffers.filter((item) =>
    item.trackingUrl
      ? item.rel.includes("sponsored") && item.rel.includes("nofollow") && item.rel.includes("noopener")
      : item.rel.includes("noopener"),
  );
  const placeholderOffers = activeOffers.filter((item) => /example\.com|^Vendor\b/i.test(`${item.destinationUrl} ${item.merchantName}`));
  const fullyDescribed = activeOffers.filter(
    (item) => item.summary && item.bestFor && item.notFor && item.priceBand && item.pricingSummary && item.pros.length >= 2 && item.cons.length >= 2,
  );

  return category("affiliate", "Commercial Integrity And Conversion", 16, [
    check("Disclosure", post.pageConfig.disclosure.length >= 80, 8, "Commercial disclosure is present and explicit.", "Affiliate disclosure is missing or too thin."),
    check("Offer count", activeOffers.length >= 3, 7, `${activeOffers.length} active offers are available.`, `${activeOffers.length} active offers; comparison SERPs usually need at least 3.`),
    check("External link attributes", compliantLinks.length === activeOffers.length && activeOffers.length > 0, 7, "Monetized and direct external links use appropriate rel attributes.", "Some external links are missing appropriate rel attributes."),
    check("No placeholder commerce", placeholderOffers.length === 0, 7, "No placeholder merchants or example.com destinations are published.", "Placeholder merchants or example.com destinations are still published."),
    check("Offer decision data", fullyDescribed.length === activeOffers.length && activeOffers.length > 0, 7, "Every active offer includes summary, fit, pricing, pros, and cons.", "Some active offers lack buyer decision fields."),
    check("CTA localization", activeOffers.every((item) => item.ctaTextEn && item.ctaTextMs && item.ctaTextZhHans), 5, "Affiliate CTAs are localized across all locales.", "Some affiliate CTAs are not fully localized."),
    check("Transparent merchant identity", activeOffers.every((item) => item.merchantName && item.anchorText), 5, "Merchant identity is visible in CMS data.", "Some offers hide or omit merchant identity."),
  ]);
}

function buildLocalizationCategory(post: CmsBlogPost) {
  const locales = new Set(post.translations.map((item) => item.locale));
  const slugs = new Set(post.translations.map((item) => item.slug));
  const en = post.translations.find((item) => item.locale === "en");
  const localized = post.translations.filter((item) => item.locale !== "en");
  const uniqueCopy = localized.every((item) => item.title !== en?.title && item.metaDescription !== en?.metaDescription && item.quickAnswer !== en?.quickAnswer);

  return category("localization", "APAC Localization", 14, [
    check("Locale coverage", LOCALES.every((item) => locales.has(item.code)), 9, "English, Bahasa Malaysia, and Simplified Chinese are present.", "Missing one or more required locales."),
    check("Unique localized slugs", slugs.size === post.translations.length, 5, "Localized slugs are unique.", "Localized slugs collide."),
    check("Localized copy, not fallback", uniqueCopy, 7, "Non-English pages use distinct localized copy.", "A non-English locale appears to reuse English copy."),
    check("Locale-first routing", post.translations.every((item) => getLocalePath(item.locale, item.slug).startsWith(`/${getLocaleByCode(item.locale).pathSegment}/blog/`)), 6, "All public URLs use locale-first blog routing.", "Some URLs are not locale-first."),
    check("Localized meta descriptions", localized.every((item) => item.metaDescription.length > 40), 5, "Localized descriptions are populated.", "Some localized descriptions are too thin."),
  ]);
}

function buildTrustCategory(translation: TranslationDraft, context: SeoScoreContext) {
  const body = `${translation.body} ${translation.sections.map((item) => item.sectionBody).join(" ")}`;
  const statesEvidenceBoundary = /did not run|did not test|official.*documentation|tidak menjalankan|tidak mendakwa|没有进行|不会声称|官方.*文档/i.test(body);
  const mentionsLimits = /not for|skip|tradeoff|complaint|constraint|kurang|不适合|限制/i.test(body);

  return category("trust", "E-E-A-T And Rich Results", 10, [
    check("Named publisher", true, 4, "Publisher is consistently shown as launcher."),
    check("Updated date", true, 4, "Updated date is rendered from CMS data."),
    check("JSON-LD schema", context.hasJsonLd, 8, "Structured data is present in app code.", "No JSON-LD Article/FAQ/Product schema detected."),
    check("Evidence boundaries", statesEvidenceBoundary, 7, "Copy clearly states its evidence and testing boundaries.", "Copy does not clearly state whether claims come from documentation or hands-on testing."),
    check("Tradeoffs and limits", mentionsLimits, 5, "Copy includes limits/tradeoffs.", "Copy needs clearer limitations and non-fit guidance."),
  ]);
}

function buildExperimentCategory(context: SeoScoreContext) {
  return category("testing", "A/B Testing Readiness", 8, [
    check("Stable conversion surfaces", true, 5, "Template has repeatable affiliate cards, comparison table, and lead-offer CTA."),
    check("Share intent surface", context.hasShareControls, 4, "Native share, social posting, link copy, and story-card controls exist.", "No reusable social sharing surface was detected."),
    check("Explicit analytics events", context.hasAnalyticsEvents, 6, "Analytics event taxonomy and template hooks exist.", "No event taxonomy or experiment assignment was detected in code."),
    check("Variant registry", context.hasVariantRegistry, 5, "Experiment variants are centrally defined.", "No central A/B variant registry exists yet."),
  ]);
}

function topActions(categories: ScoreCategory[]) {
  return categories
    .flatMap((item) => item.checks.map((checkItem) => ({ ...checkItem, category: item.title, weightedLoss: item.weight * ((checkItem.max - checkItem.points) / Math.max(checkItem.max, 1)) })))
    .filter((item) => item.state !== "pass")
    .sort((a, b) => b.weightedLoss - a.weightedLoss)
    .slice(0, 8)
    .map((item) => `${item.category}: ${item.label} - ${item.detail}`);
}

function experiments(report: Pick<SeoScoreReport, "categories">): Experiment[] {
  const categoryScore = Object.fromEntries(report.categories.map((item) => [item.key, item.score]));
  const backlog: Experiment[] = [
    {
      area: "SERP CTR",
      hypothesis: "A stronger alternative/comparison title will lift organic CTR without hurting relevance.",
      variantA: "Plaud Note Alternatives: Better Options for 2026",
      variantB: "Best Plaud Note Alternatives for Meetings, Interviews, and Study Notes",
      metric: "Search Console CTR, average position, non-brand clicks.",
    },
    {
      area: "Affiliate CTR",
      hypothesis: "Use-case-first CTA labels will outperform generic price CTAs for investigation-intent visitors.",
      variantA: "See recorder alternative",
      variantB: "Compare against Plaud Note",
      metric: "Affiliate card CTR, lead-offer CTA CTR, outbound click rate by locale.",
    },
    {
      area: "Commercial Trust",
      hypothesis: "Adding a compact scoring rubric before offers will increase qualified clicks and reduce pogo-sticking.",
      variantA: "Current quick answer followed by offers.",
      variantB: "Quick answer plus 5-factor scoring rubric before offers.",
      metric: "Scroll depth to comparison table, affiliate CTR, return-to-SERP proxy.",
    },
    {
      area: "Snippet Capture",
      hypothesis: "A short ordered list in the quick answer will increase featured-snippet eligibility.",
      variantA: "Paragraph quick answer.",
      variantB: "One-sentence answer plus 3 ordered reasons.",
      metric: "Impressions for question queries, rich result/featured-snippet visibility, above-fold dwell time.",
    },
    {
      area: "Localization",
      hypothesis: "Locale-specific buyer objections will improve engagement in MY and ZH traffic.",
      variantA: "Directly localized comparison copy.",
      variantB: "Localized copy with Malaysia/Singapore payment, availability, warranty, and app-language objections.",
      metric: "Locale-specific scroll depth, outbound CTR, save intent, SERP query growth.",
    },
  ];

  if ((categoryScore.technical ?? 100) < 80) {
    backlog.unshift({
      area: "Crawlability",
      hypothesis: "Sitemap, robots, and absolute metadata will increase discovered localized URLs and stabilize canonical signals.",
      variantA: "Current metadata only.",
      variantB: "Sitemap + robots + absolute canonical + hreflang sitemap alternates.",
      metric: "Indexed URL count, duplicate/canonical warnings, crawl stats by locale.",
    });
  }

  if ((categoryScore.trust ?? 100) < 70) {
    backlog.unshift({
      area: "E-E-A-T",
      hypothesis: "Explicit hands-on evidence and limitations will reduce thin-affiliate risk and improve long-click behavior.",
      variantA: "Current methodology paragraph.",
      variantB: "Methodology with test conditions, evidence notes, limitations, and last-checked dates.",
      metric: "Average engagement time, scroll depth past methodology, affiliate CTR quality.",
    });
  }

  return backlog.slice(0, 7);
}

export function scoreBlogPost(post: CmsBlogPost, locale: LocaleCode, context: SeoScoreContext): SeoScoreReport {
  const translation = post.translations.find((item) => item.locale === locale) || post.translations.find((item) => item.locale === "en") || post.translations[0];
  const audit = auditPage(post);
  const categories = [
    buildTechnicalCategory(post, translation, locale, context),
    buildOnPageCategory(translation, post.pageConfig.primaryKeyword),
    buildContentCategory(post, translation),
    buildAffiliateCategory(post),
    buildLocalizationCategory(post),
    buildTrustCategory(translation, context),
    buildExperimentCategory(context),
  ];
  const weightedScore = Math.round(categories.reduce((sum, item) => sum + item.score * item.weight, 0) / categories.reduce((sum, item) => sum + item.weight, 0));
  const baseReport = {
    pageId: post.id,
    slug: translation.slug,
    locale,
    url: localizedUrl(locale, translation.slug, context.siteUrl),
    score: weightedScore,
    grade: grade(weightedScore),
    categories,
    blockers: audit.blockers,
    warnings: audit.warnings,
    topActions: topActions(categories),
    experiments: [] as Experiment[],
  } satisfies SeoScoreReport;

  return {
    ...baseReport,
    experiments: experiments(baseReport),
  };
}

function stateIcon(state: ScoreState) {
  if (state === "pass") return "PASS";
  if (state === "warn") return "WARN";
  return "FAIL";
}

export function renderSeoScoreMarkdown(report: SeoScoreReport) {
  const lines: string[] = [];

  lines.push(`# SEO Score Report: ${report.slug}`);
  lines.push("");
  lines.push(`- URL: ${report.url}`);
  lines.push(`- Locale: ${report.locale}`);
  lines.push(`- Score: ${report.score}/100 (${report.grade})`);
  lines.push(`- Page ID: ${report.pageId}`);
  lines.push("");
  lines.push("## Category Scores");
  lines.push("");
  for (const categoryItem of report.categories) {
    lines.push(`- ${categoryItem.title}: ${categoryItem.score}/100 (weight ${categoryItem.weight})`);
  }
  lines.push("");
  lines.push("## Highest-Leverage Fixes");
  lines.push("");
  if (report.topActions.length === 0) {
    lines.push("- No major gaps detected by this scoring pass.");
  } else {
    for (const action of report.topActions) {
      lines.push(`- ${action}`);
    }
  }
  lines.push("");
  lines.push("## Detailed Checks");
  for (const categoryItem of report.categories) {
    lines.push("");
    lines.push(`### ${categoryItem.title}`);
    lines.push("");
    for (const checkItem of categoryItem.checks) {
      lines.push(`- ${stateIcon(checkItem.state)} ${checkItem.label}: ${checkItem.points}/${checkItem.max}. ${checkItem.detail}`);
    }
  }
  lines.push("");
  lines.push("## CMS Audit Blockers");
  lines.push("");
  if (report.blockers.length === 0) {
    lines.push("- None.");
  } else {
    for (const blocker of report.blockers) {
      lines.push(`- ${blocker}`);
    }
  }
  lines.push("");
  lines.push("## CMS Audit Warnings");
  lines.push("");
  if (report.warnings.length === 0) {
    lines.push("- None.");
  } else {
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
  }
  lines.push("");
  lines.push("## A/B Testing Backlog");
  lines.push("");
  for (const experiment of report.experiments) {
    lines.push(`- ${experiment.area}: ${experiment.hypothesis}`);
    lines.push(`  - Variant A: ${experiment.variantA}`);
    lines.push(`  - Variant B: ${experiment.variantB}`);
    lines.push(`  - Metric: ${experiment.metric}`);
  }
  lines.push("");
  lines.push("## Operating Cadence");
  lines.push("");
  lines.push("- Run this score after each content/template change and before publishing cloned pages.");
  lines.push("- Promote a variant only after Search Console, outbound CTR, and save-intent data point in the same direction.");
  lines.push("- Do not fake product testing, ratings, availability, or merchant claims to improve the score.");

  return `${lines.join("\n")}\n`;
}
