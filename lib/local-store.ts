import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  type CmsBlogPost,
  type AffiliateLinkDraft,
  type FaqItemDraft,
  type ContentSectionDraft,
  type PageConfigDraft,
  type TranslationDraft,
  samplePost,
} from "@/lib/sample-data";

const fallbackStorePath = path.join(process.cwd(), "data", "pages.json");

function clonePost<T>(value: T): T {
  return structuredClone(value);
}

function normalizeStringArray(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeSection(raw: unknown, fallbackId: string): ContentSectionDraft {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : fallbackId,
    sectionTitle: typeof candidate.sectionTitle === "string" ? candidate.sectionTitle : "",
    sectionImageUrl: typeof candidate.sectionImageUrl === "string" ? candidate.sectionImageUrl : "",
    sectionBody: typeof candidate.sectionBody === "string" ? candidate.sectionBody : "",
  };
}

function normalizeFaqItem(raw: unknown, fallbackId: string): FaqItemDraft {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : fallbackId,
    question: typeof candidate.question === "string" ? candidate.question : "",
    answer: typeof candidate.answer === "string" ? candidate.answer : "",
  };
}

function normalizeTranslation(raw: unknown): TranslationDraft {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const locale = typeof candidate.locale === "string" ? candidate.locale : "en";

  return {
    locale: locale as TranslationDraft["locale"],
    title: typeof candidate.title === "string" ? candidate.title : "",
    slug: typeof candidate.slug === "string" ? candidate.slug : "",
    metaTitle: typeof candidate.metaTitle === "string" ? candidate.metaTitle : "",
    metaDescription: typeof candidate.metaDescription === "string" ? candidate.metaDescription : "",
    quickAnswer: typeof candidate.quickAnswer === "string" ? candidate.quickAnswer : "",
    heroImageUrl: typeof candidate.heroImageUrl === "string" ? candidate.heroImageUrl : "",
    keyTakeaways: normalizeStringArray(candidate.keyTakeaways),
    sections: Array.isArray(candidate.sections)
      ? candidate.sections.map((section, index) => normalizeSection(section, `${locale}-section-${index + 1}`))
      : [],
    faqItems: Array.isArray(candidate.faqItems)
      ? candidate.faqItems.map((item, index) => normalizeFaqItem(item, `${locale}-faq-${index + 1}`))
      : [],
    body: typeof candidate.body === "string" ? candidate.body : "",
  };
}

function normalizeAffiliateLink(raw: unknown, index: number): AffiliateLinkDraft {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : `fallback-offer-${index + 1}`,
    merchantName: typeof candidate.merchantName === "string" ? candidate.merchantName : "",
    anchorText: typeof candidate.anchorText === "string" ? candidate.anchorText : "",
    destinationUrl: typeof candidate.destinationUrl === "string" ? candidate.destinationUrl : "",
    trackingUrl: typeof candidate.trackingUrl === "string" ? candidate.trackingUrl : "",
    imageUrl: typeof candidate.imageUrl === "string" ? candidate.imageUrl : "",
    imageLinkUrl: typeof candidate.imageLinkUrl === "string" ? candidate.imageLinkUrl : "",
    sourceUrls: Array.isArray(candidate.sourceUrls)
      ? candidate.sourceUrls.filter((item): item is { label: string; url: string } => {
          if (!item || typeof item !== "object") return false;
          const source = item as Record<string, unknown>;
          return typeof source.label === "string" && typeof source.url === "string";
        })
      : [],
    rel:
      typeof candidate.rel === "string" && candidate.rel.trim()
        ? candidate.rel
        : "sponsored nofollow noopener",
    target: typeof candidate.target === "string" && candidate.target.trim() ? candidate.target : "_blank",
    ctaTextEn: typeof candidate.ctaTextEn === "string" ? candidate.ctaTextEn : "Check current price",
    ctaTextMs: typeof candidate.ctaTextMs === "string" ? candidate.ctaTextMs : "Semak harga terkini",
    ctaTextZhHans:
      typeof candidate.ctaTextZhHans === "string" ? candidate.ctaTextZhHans : "查看最新价格",
    summary: typeof candidate.summary === "string" ? candidate.summary : "",
    bestFor: typeof candidate.bestFor === "string" ? candidate.bestFor : "",
    notFor: typeof candidate.notFor === "string" ? candidate.notFor : "",
    priceBand: typeof candidate.priceBand === "string" ? candidate.priceBand : "",
    pricingSummary: typeof candidate.pricingSummary === "string" ? candidate.pricingSummary : "",
    pros: normalizeStringArray(candidate.pros),
    cons: normalizeStringArray(candidate.cons),
    score: typeof candidate.score === "number" ? candidate.score : 0,
    isActive: typeof candidate.isActive === "boolean" ? candidate.isActive : true,
    localizedContent:
      candidate.localizedContent && typeof candidate.localizedContent === "object"
        ? (candidate.localizedContent as AffiliateLinkDraft["localizedContent"])
        : undefined,
  };
}

function normalizePageConfig(raw: unknown): PageConfigDraft {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    templateKey: typeof candidate.templateKey === "string" ? candidate.templateKey : "best-x-for-y-in-z",
    category: typeof candidate.category === "string" ? candidate.category : "",
    useCase: typeof candidate.useCase === "string" ? candidate.useCase : "",
    market: typeof candidate.market === "string" ? candidate.market : "",
    primaryKeyword: typeof candidate.primaryKeyword === "string" ? candidate.primaryKeyword : "",
    disclosure: typeof candidate.disclosure === "string" ? candidate.disclosure : "",
  };
}

function normalizeFallbackPost(raw: unknown): CmsBlogPost {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : crypto.randomUUID(),
    slug: typeof candidate.slug === "string" ? candidate.slug : "",
    status: candidate.status === "published" ? "published" : "draft",
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
    pageConfig: normalizePageConfig(candidate.pageConfig),
    translations: Array.isArray(candidate.translations)
      ? candidate.translations.map((translation) => normalizeTranslation(translation))
      : [],
    affiliateLinks: Array.isArray(candidate.affiliateLinks)
      ? candidate.affiliateLinks.map((link, index) => normalizeAffiliateLink(link, index))
      : [],
  };
}

function ensureFallbackFile() {
  mkdirSync(path.dirname(fallbackStorePath), { recursive: true });

  try {
    readFileSync(fallbackStorePath, "utf8");
  } catch {
    writeFileSync(fallbackStorePath, JSON.stringify([samplePost], null, 2));
  }
}

function readFallbackPosts(): CmsBlogPost[] {
  ensureFallbackFile();

  try {
    const raw = readFileSync(fallbackStorePath, "utf8");
    if (!raw.trim()) {
      return [clonePost(samplePost)];
    }

    const parsed = JSON.parse(raw) as unknown[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [clonePost(samplePost)];
    }

    return parsed.map((post) => normalizeFallbackPost(post));
  } catch {
    return [clonePost(samplePost)];
  }
}

function writeFallbackPosts(posts: CmsBlogPost[]) {
  ensureFallbackFile();
  writeFileSync(fallbackStorePath, JSON.stringify(posts, null, 2));
}

function matchesPost(post: CmsBlogPost, idOrSlug: string) {
  if (post.id === idOrSlug || post.slug === idOrSlug) {
    return true;
  }

  return post.translations.some((translation) => translation.slug === idOrSlug);
}

export function getFallbackPosts(): CmsBlogPost[] {
  return readFallbackPosts();
}

export function getFallbackPostByIdOrSlug(idOrSlug: string): CmsBlogPost | null {
  const post = readFallbackPosts().find((candidate) => matchesPost(candidate, idOrSlug));
  return post ? clonePost(post) : null;
}

export function createFallbackPost(payload: {
  slug: string;
  pageConfig: PageConfigDraft;
  translations: TranslationDraft[];
  affiliateLinks: AffiliateLinkDraft[];
  status: CmsBlogPost["status"];
}): CmsBlogPost {
  const posts = readFallbackPosts();
  const now = new Date().toISOString();

  const created: CmsBlogPost = {
    id: crypto.randomUUID(),
    slug: payload.slug,
    status: payload.status,
    pageConfig: payload.pageConfig,
    translations: payload.translations,
    affiliateLinks: payload.affiliateLinks,
    updatedAt: now,
  };

  posts.push(created);
  writeFallbackPosts(posts);

  return clonePost(created);
}

export function saveFallbackPost(
  postId: string,
  payload: {
    slug: string;
    pageConfig: PageConfigDraft;
    translations: TranslationDraft[];
    affiliateLinks: AffiliateLinkDraft[];
    status: CmsBlogPost["status"];
  },
): CmsBlogPost {
  const posts = readFallbackPosts();
  const index = posts.findIndex((post) => post.id === postId);

  if (index === -1) {
    throw new Error("Post not found");
  }

  const existing = posts[index];
  const now = new Date().toISOString();
  const next: CmsBlogPost = {
    ...existing,
    slug: payload.slug || existing.slug,
    pageConfig: payload.pageConfig,
    translations: payload.translations,
    affiliateLinks: payload.affiliateLinks,
    status: payload.status,
    updatedAt: now,
  };

  posts[index] = next;
  writeFallbackPosts(posts);

  return clonePost(next);
}

export function ensureFallbackSeed() {
  ensureFallbackFile();

  const posts = readFallbackPosts();
  if (posts.length === 0) {
    writeFallbackPosts([clonePost(samplePost)]);
  }
}
