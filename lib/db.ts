import { createClient } from "@supabase/supabase-js";
import {
  type CmsBlogPost,
  type AffiliateLinkDraft,
  type ContentSectionDraft,
  type FaqItemDraft,
  type PageConfigDraft,
  type TranslationDraft,
} from "@/lib/sample-data";
import {
  createFallbackPost,
  getFallbackPosts,
  getFallbackPostByIdOrSlug,
  saveFallbackPost,
  ensureFallbackSeed,
} from "@/lib/local-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

type PostTranslationRow = {
  locale: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  quick_answer: string;
  hero_image_url: string;
  key_takeaways: unknown;
  sections: unknown;
  faq_items: unknown;
  body: string;
};

type AffiliateLinkRow = {
  id: string;
  merchant_name: string;
  anchor_text: string;
  destination_url: string;
  tracking_url: string | null;
  image_url: string | null;
  image_link_url: string | null;
  source_urls: unknown;
  localized_content: unknown;
  rel: string;
  target: string;
  cta_text_en: string;
  cta_text_ms: string;
  cta_text_zh_hans: string;
  summary: string;
  best_for: string;
  not_for: string;
  price_band: string;
  pricing_summary: string;
  pros: unknown;
  cons: unknown;
  score: number | null;
  is_active: boolean;
};

type PostRow = {
  id: string;
  slug: string;
  status: CmsBlogPost["status"];
  page_config: unknown;
  updated_at: string;
  post_translations: PostTranslationRow[];
  affiliate_links: AffiliateLinkRow[];
};

function createServerClient() {
  if (!supabaseUrl || !supabaseAnon) {
    return null;
  }

  const key = supabaseServiceRole || supabaseAnon;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const postSelect = `
      id,
      slug,
      status,
      page_config,
      updated_at,
      post_translations:post_translations(id, locale, title, slug, meta_title, meta_description, quick_answer, hero_image_url, key_takeaways, sections, faq_items, body),
      affiliate_links(id, merchant_name, anchor_text, destination_url, tracking_url, image_url, image_link_url, source_urls, localized_content, rel, target, cta_text_en, cta_text_ms, cta_text_zh_hans, summary, best_for, not_for, price_band, pricing_summary, pros, cons, score, is_active)
    `;

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function normalizeFaqItem(raw: unknown, fallbackId: string): FaqItemDraft {
  if (!raw || typeof raw !== "object") {
    return {
      id: fallbackId,
      question: "",
      answer: "",
    };
  }

  const candidate = raw as Record<string, unknown>;

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : fallbackId,
    question: typeof candidate.question === "string" ? candidate.question : "",
    answer: typeof candidate.answer === "string" ? candidate.answer : "",
  };
}

function normalizeFaqItems(raw: unknown): FaqItemDraft[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry, index) => normalizeFaqItem(entry, `faq-${index + 1}`))
    .filter((item) => item.question || item.answer);
}

function toDbFaqItems(items: FaqItemDraft[]): FaqItemDraft[] {
  return items.map((item, index) => ({
    id: item.id || `faq-${index + 1}`,
    question: item.question || "",
    answer: item.answer || "",
  }));
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

function normalizeSection(raw: unknown, fallbackId: string): ContentSectionDraft {
  if (!raw || typeof raw !== "object") {
    return {
      id: fallbackId,
      sectionTitle: "",
      sectionImageUrl: "",
      sectionBody: "",
    };
  }

  const candidate = raw as Record<string, unknown>;

  const id =
    typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : fallbackId;

  const sectionTitle =
    typeof candidate.sectionTitle === "string"
      ? candidate.sectionTitle
      : typeof candidate.section_title === "string"
        ? candidate.section_title
        : "";

  const sectionImageUrl =
    typeof candidate.sectionImageUrl === "string"
      ? candidate.sectionImageUrl
      : typeof candidate.section_image_url === "string"
        ? candidate.section_image_url
        : "";

  const sectionBody =
    typeof candidate.sectionBody === "string"
      ? candidate.sectionBody
      : typeof candidate.section_body === "string"
        ? candidate.section_body
        : "";

  return {
    id,
    sectionTitle,
    sectionImageUrl,
    sectionBody,
  };
}

function normalizeSections(raw: unknown): ContentSectionDraft[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry, index) => normalizeSection(entry, `section-${index + 1}`))
    .filter((entry) => {
      return !!(entry.sectionTitle || entry.sectionImageUrl || entry.sectionBody);
    });
}

function toDbSections(sections: ContentSectionDraft[]): ContentSectionDraft[] {
  return sections.map((section, index) => ({
    id: section.id || `section-${index + 1}`,
    sectionTitle: section.sectionTitle || "",
    sectionImageUrl: section.sectionImageUrl || "",
    sectionBody: section.sectionBody || "",
  }));
}

function toLocalePost(row: PostRow): CmsBlogPost {
  const translationRows = row.post_translations ?? [];
  const linkRows = row.affiliate_links ?? [];

  const translations: TranslationDraft[] = translationRows.map((translation) => ({
    locale: translation.locale as TranslationDraft["locale"],
    title: translation.title,
    slug: translation.slug,
    metaTitle: translation.meta_title,
    metaDescription: translation.meta_description,
    quickAnswer: translation.quick_answer,
    heroImageUrl: translation.hero_image_url,
    keyTakeaways: normalizeStringArray(translation.key_takeaways),
    sections: normalizeSections(translation.sections),
    faqItems: normalizeFaqItems(translation.faq_items),
    body: translation.body,
  }));

  const affiliateLinks: AffiliateLinkDraft[] = linkRows
    .filter((link) => !!link.id)
    .map((link) => ({
      id: link.id,
      merchantName: link.merchant_name,
      anchorText: link.anchor_text,
      destinationUrl: link.destination_url,
      trackingUrl: link.tracking_url ?? "",
      imageUrl: link.image_url ?? "",
      imageLinkUrl: link.image_link_url ?? "",
      sourceUrls: Array.isArray(link.source_urls)
        ? link.source_urls.filter((item): item is { label: string; url: string } => {
            if (!item || typeof item !== "object") return false;
            const source = item as Record<string, unknown>;
            return typeof source.label === "string" && typeof source.url === "string";
          })
        : [],
      localizedContent:
        link.localized_content && typeof link.localized_content === "object"
          ? (link.localized_content as AffiliateLinkDraft["localizedContent"])
          : undefined,
      rel: link.rel,
      target: link.target,
      ctaTextEn: link.cta_text_en,
      ctaTextMs: link.cta_text_ms,
      ctaTextZhHans: link.cta_text_zh_hans,
      summary: link.summary,
      bestFor: link.best_for,
      notFor: link.not_for,
      priceBand: link.price_band,
      pricingSummary: link.pricing_summary,
      pros: normalizeStringArray(link.pros),
      cons: normalizeStringArray(link.cons),
      score: link.score ?? 0,
      isActive: link.is_active,
    }));

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    pageConfig: normalizePageConfig(row.page_config),
    translations,
    affiliateLinks,
    updatedAt: row.updated_at,
  };
}

export async function listPostsForAdmin(): Promise<CmsBlogPost[]> {
  const client = createServerClient();

  if (!client) {
    ensureFallbackSeed();
    return getFallbackPosts();
  }

  const { data, error } = await client
    .from("posts")
    .select(postSelect)
    .order("updated_at", { ascending: true });

  if (error || !data) {
    console.error("Supabase error", error);
    ensureFallbackSeed();
    return getFallbackPosts();
  }

  return (data as unknown as PostRow[]).map(toLocalePost);
}

export async function getPostByIdOrSlug(idOrSlug: string): Promise<CmsBlogPost | null> {
  const client = createServerClient();

  if (!client) {
    ensureFallbackSeed();
    return getFallbackPostByIdOrSlug(idOrSlug);
  }

  const query = client.from("posts").select(postSelect);

  const byId = await query.eq("id", idOrSlug).maybeSingle();

  if (byId.data) {
    const post = byId.data as unknown as PostRow;
    return toLocalePost(post);
  }

  const bySlug = await client
    .from("posts")
    .select(postSelect)
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (bySlug.data) {
    return toLocalePost(bySlug.data as unknown as PostRow);
  }

  const translationMatch = await client
    .from("post_translations")
    .select("post_id")
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (translationMatch.data?.post_id) {
    const byTranslationSlug = await client
      .from("posts")
      .select(postSelect)
      .eq("id", translationMatch.data.post_id)
      .maybeSingle();

    if (byTranslationSlug.data) {
      return toLocalePost(byTranslationSlug.data as unknown as PostRow);
    }

    if (byTranslationSlug.error) {
      console.error("Supabase error", byTranslationSlug.error);
    }
  }

  if (byId.error && bySlug.error && translationMatch.error) {
    console.error("Supabase error", byId.error, bySlug.error, translationMatch.error);
  }

  return null;
}

type SavePostPayload = {
  id: string;
  slug: string;
  status: CmsBlogPost["status"];
  pageConfig: PageConfigDraft;
  translations: TranslationDraft[];
  affiliateLinks: AffiliateLinkDraft[];
};

type CreatePostPayload = {
  slug: string;
  status: CmsBlogPost["status"];
  pageConfig: PageConfigDraft;
  translations: TranslationDraft[];
  affiliateLinks: AffiliateLinkDraft[];
};

export async function createPost(payload: CreatePostPayload): Promise<CmsBlogPost> {
  const client = createServerClient();

  if (!client) {
    return createFallbackPost(payload);
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const { error } = await client.from("posts").insert({
    id,
    slug: payload.slug,
    status: payload.status,
    page_config: payload.pageConfig,
    updated_at: now,
  });

  if (error) {
    console.error("Failed creating post", error);
    throw new Error("Failed to create post");
  }

  return savePost({
    id,
    slug: payload.slug,
    status: payload.status,
    pageConfig: payload.pageConfig,
    translations: payload.translations,
    affiliateLinks: payload.affiliateLinks,
  });
}

export async function savePost(payload: SavePostPayload): Promise<CmsBlogPost> {
  const client = createServerClient();

  if (!client) {
    return saveFallbackPost(payload.id, payload);
  }

  const now = new Date().toISOString();

  const { error: postError } = await client
    .from("posts")
    .update({
      slug: payload.slug,
      status: payload.status,
      page_config: payload.pageConfig,
      updated_at: now,
    })
    .eq("id", payload.id);

  if (postError) {
    console.error("Failed updating post", postError);
    throw new Error("Failed to save post metadata");
  }

  if (payload.translations.length > 0) {
    const rows = payload.translations.map((translation) => ({
      post_id: payload.id,
      locale: translation.locale,
      title: translation.title,
      slug: translation.slug,
      meta_title: translation.metaTitle,
      meta_description: translation.metaDescription,
      quick_answer: translation.quickAnswer,
      hero_image_url: translation.heroImageUrl,
      key_takeaways: translation.keyTakeaways,
      sections: toDbSections(translation.sections),
      faq_items: toDbFaqItems(translation.faqItems),
      body: translation.body,
    }));

    const { error: translationError } = await client
      .from("post_translations")
      .upsert(rows, { onConflict: "post_id,locale" });

    if (translationError) {
      console.error("Failed saving translations", translationError);
      throw new Error("Failed to save translations");
    }
  }

  const { error: deleteLinksError } = await client
    .from("affiliate_links")
    .delete()
    .eq("post_id", payload.id);

  if (deleteLinksError) {
    console.error("Failed deleting affiliate links", deleteLinksError);
    throw new Error("Failed to save affiliate links");
  }

  const insertLinks = payload.affiliateLinks
    .filter((link) => link.destinationUrl || link.anchorText)
    .map((link) => ({
      id: crypto.randomUUID(),
      post_id: payload.id,
      merchant_name: link.merchantName,
      anchor_text: link.anchorText,
      destination_url: link.destinationUrl,
      tracking_url: link.trackingUrl || null,
      image_url: link.imageUrl || null,
      image_link_url: link.imageLinkUrl || null,
      source_urls: link.sourceUrls || [],
      localized_content: link.localizedContent || {},
      rel: link.rel || "sponsored nofollow noopener",
      target: link.target || "_blank",
      cta_text_en: link.ctaTextEn || "Check current price",
      cta_text_ms: link.ctaTextMs || "Semak harga terkini",
      cta_text_zh_hans: link.ctaTextZhHans || "查看最新价格",
      summary: link.summary || "",
      best_for: link.bestFor || "",
      not_for: link.notFor || "",
      price_band: link.priceBand || "",
      pricing_summary: link.pricingSummary || "",
      pros: link.pros || [],
      cons: link.cons || [],
      score: link.score || 0,
      is_active: link.isActive,
      created_at: now,
      updated_at: now,
    }));

  if (insertLinks.length > 0) {
    const { error: insertError } = await client
      .from("affiliate_links")
      .insert(insertLinks);

    if (insertError) {
      console.error("Failed inserting affiliate links", insertError);
      throw new Error("Failed to save affiliate links");
    }
  }

  const saved = await getPostByIdOrSlug(payload.id);
  if (!saved) {
    throw new Error("Saved but not retrievable. Check permissions.");
  }

  return saved;
}
