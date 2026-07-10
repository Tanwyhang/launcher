import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createPost, deletePost, getPostByIdOrSlug, listPostsForAdmin, savePost } from "@/lib/db";
import { renderSeoScoreMarkdown, scoreBlogPost, type SeoScoreContext } from "@/lib/seo-score";
import {
  auditPage,
  buildClonedPageDraft,
  buildTemplatePageDraft,
  type ClonePageInput,
  type CreatePageInput,
} from "@/lib/seo-page";
import type { AffiliateLinkDraft } from "@/lib/sample-data";
import { getLocaleByCode, getLocaleByPathSegment, LOCALES, type LocaleCode } from "@/lib/utils";

type Args = {
  _: string[];
  [key: string]: string | boolean | string[];
};

function parseArgs(argv: string[]): Args {
  const args: Args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function getStringArg(args: Args, key: string): string | null {
  const value = args[key];
  return typeof value === "string" ? value : null;
}

function requireStringArg(args: Args, key: string): string {
  const value = getStringArg(args, key);
  if (!value) {
    throw new Error(`Missing required argument --${key}`);
  }
  return value;
}

function printHelp() {
  console.log(`SEO CLI

Usage:
  bun run seo create-page --category "AI note takers" --use-case "sales teams" --market "Malaysia" --keyword "best ai note takers for sales teams malaysia" --slug-en best-ai-note-takers-sales-malaysia --slug-ms ai-note-taker-sales-malaysia --slug-zh ai-note-taker-sales-malaysia-zh
  bun run seo clone-page --source best-ai-note-takers-for-meetings --slug-en new-en --slug-ms new-ms --slug-zh new-zh --market "Singapore" --use-case "sales teams"
  bun run seo assign-offers --id best-ai-note-takers-for-meetings --file ./offers.json
  bun run seo import-pages --file ./data/seed-pages-ai-cluster.json
  bun run seo audit-page --id best-ai-note-takers-for-meetings
  bun run seo score-page --id plaud-note-alternatives --locale en --site-url http://localhost:3000 --out reports/seo/plaud-note-alternatives-en.md
  bun run seo delete-page --id plaud-note-alternatives --seed-file data/seed-pages-first-topic-cluster.json --yes

Commands:
  create-page    Create a draft page from the best-x-for-y-in-z template
  clone-page     Duplicate a winning page into a new slug/market/use-case set
  assign-offers  Replace affiliate offers on one page from a JSON file
  import-pages   Bulk create full pages from a JSON seed file
  audit-page     Audit one page for SEO/commercial readiness
  score-page     Generate a weighted SEO + A/B testing score report for one page
  delete-page    Delete one page, optionally removing it from a JSON seed file
`);
}

function hasSlugConflict(existing: Awaited<ReturnType<typeof listPostsForAdmin>>, slugs: string[], excludeId?: string) {
  const existingSlugs = new Set<string>();

  for (const post of existing) {
    if (excludeId && post.id === excludeId) {
      continue;
    }

    existingSlugs.add(post.slug);
    for (const translation of post.translations) {
      existingSlugs.add(translation.slug);
    }
  }

  return slugs.find((slug) => existingSlugs.has(slug)) || null;
}

function printAuditSummary(audit: ReturnType<typeof auditPage>) {
  console.log(`Active offers: ${audit.activeOfferCount}`);
  console.log(`Blockers: ${audit.blockers.length}`);
  console.log(`Warnings: ${audit.warnings.length}`);
}

function normalizeOffer(raw: unknown, index: number): AffiliateLinkDraft {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid offer at index ${index}`);
  }

  const candidate = raw as Record<string, unknown>;
  const merchantName = typeof candidate.merchantName === "string" ? candidate.merchantName : "";
  const anchorText = typeof candidate.anchorText === "string" ? candidate.anchorText : "";
  const destinationUrl = typeof candidate.destinationUrl === "string" ? candidate.destinationUrl : "";

  if (!merchantName || !anchorText || !destinationUrl) {
    throw new Error(`Offer ${index + 1} must include merchantName, anchorText, and destinationUrl`);
  }

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : crypto.randomUUID(),
    merchantName,
    anchorText,
    destinationUrl,
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
    rel: typeof candidate.rel === "string" && candidate.rel.trim() ? candidate.rel : "sponsored nofollow noopener",
    target: typeof candidate.target === "string" && candidate.target.trim() ? candidate.target : "_blank",
    ctaTextEn: typeof candidate.ctaTextEn === "string" && candidate.ctaTextEn.trim() ? candidate.ctaTextEn : "Check current price",
    ctaTextMs: typeof candidate.ctaTextMs === "string" && candidate.ctaTextMs.trim() ? candidate.ctaTextMs : "Semak harga terkini",
    ctaTextZhHans:
      typeof candidate.ctaTextZhHans === "string" && candidate.ctaTextZhHans.trim()
        ? candidate.ctaTextZhHans
        : "查看最新价格",
    summary: typeof candidate.summary === "string" ? candidate.summary : "",
    bestFor: typeof candidate.bestFor === "string" ? candidate.bestFor : "",
    notFor: typeof candidate.notFor === "string" ? candidate.notFor : "",
    priceBand: typeof candidate.priceBand === "string" ? candidate.priceBand : "",
    pricingSummary: typeof candidate.pricingSummary === "string" ? candidate.pricingSummary : "",
    pros: Array.isArray(candidate.pros)
      ? candidate.pros.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [],
    cons: Array.isArray(candidate.cons)
      ? candidate.cons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [],
    score: typeof candidate.score === "number" ? candidate.score : 0,
    isActive: typeof candidate.isActive === "boolean" ? candidate.isActive : true,
    localizedContent:
      candidate.localizedContent && typeof candidate.localizedContent === "object"
        ? (candidate.localizedContent as AffiliateLinkDraft["localizedContent"])
        : undefined,
  };
}

function loadOffersFromFile(filePath: string): AffiliateLinkDraft[] {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const source =
    Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { offers?: unknown[] }).offers)
        ? (parsed as { offers: unknown[] }).offers
        : null;

  if (!source) {
    throw new Error("Offer file must be an array or an object with an offers array");
  }

  return source.map((entry, index) => normalizeOffer(entry, index));
}

function loadSeedPages(filePath: string) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const source =
    Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { pages?: unknown[] }).pages)
        ? (parsed as { pages: unknown[] }).pages
        : null;

  if (!source) {
    throw new Error("Seed file must be an array or an object with a pages array");
  }

  return source;
}

function readTextIfExists(filePath: string) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function collectSourceText(directory: string): string {
  if (!existsSync(directory)) {
    return "";
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const chunks: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      chunks.push(collectSourceText(entryPath));
      continue;
    }

    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }

    const stats = statSync(entryPath);
    if (stats.size > 200_000) {
      continue;
    }

    chunks.push(readFileSync(entryPath, "utf8"));
  }

  return chunks.join("\n");
}

function buildSeoScoreContext(siteUrl?: string): SeoScoreContext {
  const appDirectory = path.join(process.cwd(), "app");
  const sourceText = ["app", "components", path.join("lib", "schema")]
    .map((directory) => collectSourceText(path.join(process.cwd(), directory)))
    .join("\n");
  const layoutSource = readTextIfExists(path.join(appDirectory, "layout.tsx"));
  const analyticsSource = readTextIfExists(path.join(process.cwd(), "lib", "analytics-events.ts"));
  const experimentSource = readTextIfExists(path.join(process.cwd(), "lib", "seo-experiments.ts"));

  return {
    siteUrl,
    hasSitemap: existsSync(path.join(appDirectory, "sitemap.ts")) || existsSync(path.join(appDirectory, "sitemap.tsx")),
    hasRobots: existsSync(path.join(appDirectory, "robots.ts")) || existsSync(path.join(appDirectory, "robots.tsx")),
    hasJsonLd: /application\/ld\+json|JsonLd|jsonLd|@context/.test(sourceText),
    hasMetadataBase: /metadataBase/.test(layoutSource),
    hasLocaleAlternates: /alternates/.test(sourceText) && /buildLanguageAlternates/.test(sourceText),
    hasLegacyRedirects: existsSync(path.join(appDirectory, "blog", "page.tsx")) && existsSync(path.join(appDirectory, "blog", "[slug]", "page.tsx")),
    hasAnalyticsEvents:
      /ANALYTICS_EVENTS/.test(analyticsSource) &&
      /affiliateCardClick|leadOfferClick|saveAuthClick|affiliate_card_click|lead_offer_click|save_auth_click/.test(sourceText + analyticsSource),
    hasVariantRegistry: /SEO_EXPERIMENTS/.test(experimentSource) && /variants/.test(experimentSource),
    hasShareControls: /ShareCube|story-card|twitter\.com\/intent\/tweet/.test(sourceText),
  };
}

function resolveLocaleArg(args: Args): LocaleCode {
  const rawLocale = getStringArg(args, "locale") || "en";
  const matchedLocale = LOCALES.find((item) => item.code === rawLocale || item.pathSegment === rawLocale) || getLocaleByPathSegment(rawLocale);

  if (!matchedLocale) {
    throw new Error(`Unsupported locale: ${rawLocale}`);
  }

  return matchedLocale.code;
}

function normalizeSeedPage(raw: unknown, index: number) {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid page seed at index ${index}`);
  }

  const candidate = raw as Record<string, unknown>;
  const slug = typeof candidate.slug === "string" ? candidate.slug : "";
  const status = candidate.status === "published" ? "published" : "draft";
  const pageConfig = candidate.pageConfig;
  const translations = candidate.translations;
  const affiliateLinks = candidate.affiliateLinks;

  if (!slug || !pageConfig || !Array.isArray(translations) || !Array.isArray(affiliateLinks)) {
    throw new Error(`Seed page ${index + 1} must include slug, pageConfig, translations, and affiliateLinks`);
  }

  return {
    slug,
    status,
    pageConfig,
    translations,
    affiliateLinks: affiliateLinks.map((offer, offerIndex) => normalizeOffer(offer, offerIndex)),
  };
}

async function handleCreatePage(args: Args) {
  const input: CreatePageInput = {
    category: requireStringArg(args, "category"),
    useCase: requireStringArg(args, "use-case"),
    market: requireStringArg(args, "market"),
    primaryKeyword: requireStringArg(args, "keyword"),
    slugEn: requireStringArg(args, "slug-en"),
    slugMs: requireStringArg(args, "slug-ms"),
    slugZhHans: requireStringArg(args, "slug-zh"),
    status: (getStringArg(args, "status") as CreatePageInput["status"]) || "draft",
  };

  const existing = await listPostsForAdmin();
  const conflict = hasSlugConflict(existing, [input.slugEn, input.slugMs, input.slugZhHans]);

  if (conflict) {
    throw new Error(`Slug already exists: ${conflict}`);
  }

  const draft = buildTemplatePageDraft(input);
  const created = await createPost(draft);
  const audit = auditPage(created);
  const output = {
    created: {
      id: created.id,
      status: created.status,
      primarySlug: created.slug,
      localeUrls: audit.localeUrls,
    },
    audit,
  };

  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`Created page ${created.id}`);
  console.log(`Status: ${created.status}`);
  console.log(`Primary slug: ${created.slug}`);
  for (const [locale, url] of Object.entries(audit.localeUrls)) {
    console.log(`${getLocaleByCode(locale as any).pathSegment}: ${url}`);
  }
  printAuditSummary(audit);
}

async function handleClonePage(args: Args) {
  const sourceId = requireStringArg(args, "source");
  const source = await getPostByIdOrSlug(sourceId);

  if (!source) {
    throw new Error(`Source page not found: ${sourceId}`);
  }

  const input: ClonePageInput = {
    slugEn: requireStringArg(args, "slug-en"),
    slugMs: requireStringArg(args, "slug-ms"),
    slugZhHans: requireStringArg(args, "slug-zh"),
    category: getStringArg(args, "category") || undefined,
    useCase: getStringArg(args, "use-case") || undefined,
    market: getStringArg(args, "market") || undefined,
    primaryKeyword: getStringArg(args, "keyword") || undefined,
    status: (getStringArg(args, "status") as ClonePageInput["status"]) || "draft",
  };

  const existing = await listPostsForAdmin();
  const conflict = hasSlugConflict(existing, [input.slugEn, input.slugMs, input.slugZhHans], source.id);

  if (conflict) {
    throw new Error(`Slug already exists: ${conflict}`);
  }

  const draft = buildClonedPageDraft(source, input);
  const created = await createPost(draft);
  const audit = auditPage(created);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          clonedFrom: source.id,
          created,
          audit,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Cloned page ${created.id} from ${source.id}`);
  console.log(`Status: ${created.status}`);
  console.log(`Primary slug: ${created.slug}`);
  for (const [locale, url] of Object.entries(audit.localeUrls)) {
    console.log(`${getLocaleByCode(locale as any).pathSegment}: ${url}`);
  }
  printAuditSummary(audit);
}

async function handleAssignOffers(args: Args) {
  const id = requireStringArg(args, "id");
  const file = requireStringArg(args, "file");
  const page = await getPostByIdOrSlug(id);

  if (!page) {
    throw new Error(`Page not found: ${id}`);
  }

  const affiliateLinks = loadOffersFromFile(file);
  const saved = await savePost({
    id: page.id,
    slug: page.slug,
    status: page.status,
    pageConfig: page.pageConfig,
    translations: page.translations,
    affiliateLinks,
  });

  const audit = auditPage(saved);

  if (args.json) {
    console.log(JSON.stringify({ updated: saved.id, offerCount: affiliateLinks.length, audit }, null, 2));
    return;
  }

  console.log(`Assigned ${affiliateLinks.length} offers to ${saved.id}`);
  printAuditSummary(audit);
}

async function handleImportPages(args: Args) {
  const file = requireStringArg(args, "file");
  const seedPages = loadSeedPages(file).map((entry, index) => normalizeSeedPage(entry, index));
  const existing = await listPostsForAdmin();
  const created: Array<{ id: string; slug: string }> = [];

  for (const seed of seedPages) {
    const translationSlugs = Array.isArray(seed.translations)
      ? seed.translations
          .map((translation) =>
            translation && typeof translation === "object" && typeof (translation as { slug?: unknown }).slug === "string"
              ? (translation as { slug: string }).slug
              : "",
          )
          .filter(Boolean)
      : [];

    const conflict = hasSlugConflict(existing, [seed.slug, ...translationSlugs]);
    if (conflict) {
      throw new Error(`Slug already exists: ${conflict}`);
    }

    const page = await createPost(seed as any);
    existing.push(page);
    created.push({ id: page.id, slug: page.slug });
  }

  if (args.json) {
    console.log(JSON.stringify({ created }, null, 2));
    return;
  }

  console.log(`Imported ${created.length} page(s)`);
  for (const page of created) {
    console.log(`- ${page.id}: ${page.slug}`);
  }
}

async function handleAuditPage(args: Args) {
  const id = requireStringArg(args, "id");
  const page = await getPostByIdOrSlug(id);

  if (!page) {
    throw new Error(`Page not found: ${id}`);
  }

  const result = auditPage(page);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Audit for ${page.id}`);
  console.log(`Primary slug: ${result.primarySlug}`);
  console.log(`Active offers: ${result.activeOfferCount}`);
  console.log("Locale URLs:");
  for (const [locale, url] of Object.entries(result.localeUrls)) {
    console.log(`  ${getLocaleByCode(locale as any).pathSegment}: ${url}`);
  }

  if (result.blockers.length === 0) {
    console.log("Blockers: none");
  } else {
    console.log("Blockers:");
    for (const blocker of result.blockers) {
      console.log(`  - ${blocker}`);
    }
  }

  if (result.warnings.length === 0) {
    console.log("Warnings: none");
  } else {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

async function handleScorePage(args: Args) {
  const id = requireStringArg(args, "id");
  const locale = resolveLocaleArg(args);
  const siteUrl = getStringArg(args, "site-url") || undefined;
  const page = await getPostByIdOrSlug(id);

  if (!page) {
    throw new Error(`Page not found: ${id}`);
  }

  const result = scoreBlogPost(page, locale, buildSeoScoreContext(siteUrl));

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const markdown = renderSeoScoreMarkdown(result);
  const outPath = getStringArg(args, "out");

  if (outPath) {
    const absoluteOutPath = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
    mkdirSync(path.dirname(absoluteOutPath), { recursive: true });
    writeFileSync(absoluteOutPath, markdown, "utf8");

    console.log(`SEO score for ${result.url}: ${result.score}/100 (${result.grade})`);
    console.log(`Report: ${absoluteOutPath}`);
    return;
  }

  console.log(markdown);
}

function deleteFromSeedFile(filePath: string, page: Awaited<ReturnType<typeof getPostByIdOrSlug>>) {
  if (!page) return 0;
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const parsed = JSON.parse(readFileSync(absolutePath, "utf8")) as unknown;
  const slugs = new Set([page.id, page.slug, ...page.translations.map((item) => item.slug)]);

  if (Array.isArray(parsed)) {
    const next = parsed.filter((entry) => !entry || typeof entry !== "object" || !slugs.has(String((entry as { slug?: unknown }).slug || "")));
    writeFileSync(absolutePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    return parsed.length - next.length;
  }

  if (parsed && typeof parsed === "object" && Array.isArray((parsed as { pages?: unknown[] }).pages)) {
    const container = parsed as { pages: unknown[] };
    const next = container.pages.filter((entry) => !entry || typeof entry !== "object" || !slugs.has(String((entry as { slug?: unknown }).slug || "")));
    writeFileSync(absolutePath, `${JSON.stringify({ ...(parsed as Record<string, unknown>), pages: next }, null, 2)}\n`, "utf8");
    return container.pages.length - next.length;
  }

  throw new Error("Seed file must be an array or an object with a pages array");
}

async function handleDeletePage(args: Args) {
  if (!args.yes) {
    throw new Error("Deletion requires --yes");
  }

  const id = requireStringArg(args, "id");
  const page = await getPostByIdOrSlug(id);

  if (!page) {
    throw new Error(`Page not found: ${id}`);
  }

  const deleted = await deletePost(page.id);
  if (!deleted) {
    throw new Error(`Page could not be deleted: ${id}`);
  }

  const seedFile = getStringArg(args, "seed-file");
  const removedFromSeed = seedFile ? deleteFromSeedFile(seedFile, page) : 0;
  console.log(`Deleted page ${page.slug} (${page.id})`);
  if (seedFile) console.log(`Removed ${removedFromSeed} matching seed page(s) from ${seedFile}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "create-page") {
    await handleCreatePage(args);
    return;
  }

  if (command === "clone-page") {
    await handleClonePage(args);
    return;
  }

  if (command === "assign-offers") {
    await handleAssignOffers(args);
    return;
  }

  if (command === "import-pages") {
    await handleImportPages(args);
    return;
  }

  if (command === "audit-page") {
    await handleAuditPage(args);
    return;
  }

  if (command === "score-page") {
    await handleScorePage(args);
    return;
  }

  if (command === "delete-page") {
    await handleDeletePage(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "CLI failed");
  process.exitCode = 1;
});
