import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

type Translation = {
  locale: "en" | "ms" | "zh-Hans";
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  quickAnswer: string;
  keyTakeaways: string[];
  body: string;
  heroImageUrl: string;
  sections: Array<{ sectionImageUrl: string; sectionTitle: string; sectionBody: string }>;
  faqItems: unknown[];
};

type Offer = {
  id: string;
  merchantName: string;
  anchorText: string;
  isActive: boolean;
  destinationUrl: string;
  trackingUrl?: string;
  imageUrl?: string;
  sourceUrls?: Array<{ label: string; url: string }>;
};

type Page = {
  id?: string;
  slug: string;
  status: "draft" | "published";
  pageConfig: Record<string, string>;
  translations: Translation[];
  affiliateLinks: Offer[];
};

const root = process.cwd();
const pagesPath = path.join(root, "data/pages.json");
const localePaths = { en: "/en", ms: "/my", "zh-Hans": "/zh" } as const;

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      index += 1;
    }
  }
  return { args, positional };
}

function stringArg(args: Record<string, string | boolean>, key: string) {
  return typeof args[key] === "string" ? args[key] : undefined;
}

function pages() {
  return JSON.parse(readFileSync(pagesPath, "utf8")) as Page[];
}

function inputPage(file: string): Page {
  const raw = JSON.parse(readFileSync(path.resolve(root, file), "utf8")) as Page | { pages?: Page[] };
  const value: Page[] = "pages" in raw && Array.isArray(raw.pages) ? raw.pages : [raw as Page];
  if (value.length !== 1) throw new Error("Pipeline validation requires exactly one page record");
  return value[0];
}

function isResearched(page: Page) {
  return page.translations.every((translation) =>
    translation.sections.length >= 5 &&
    translation.faqItems.length >= 4 &&
    articleLength(translation) >= (translation.locale === "zh-Hans" ? 1500 : 3600),
  );
}

function articleText(translation: Translation) {
  return [
    translation.title,
    translation.body,
    ...translation.sections.flatMap((section) => [section.sectionTitle, section.sectionBody]),
  ].join(" ");
}

function articleLength(translation: Translation) {
  return articleText(translation).length;
}

function readInternalLinks(body: string) {
  return Array.from(body.matchAll(/\]\((\/(?:en|my|zh)\/blog\/[^)\s]+)\)/g)).map((match) => match[1]);
}

function validHttps(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function run(command: string, args: string[], capture = false) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    const detail = capture ? String(result.stderr || result.stdout || "").trim() : "";
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }
  return String(result.stdout || "").trim();
}

function audit(page: Page) {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const existingSlugs = new Set(pages().flatMap((item) => item.translations.map((translation) => translation.slug)));
  const expectedLocales = new Set(["en", "ms", "zh-Hans"]);
  const receivedLocales = new Set(page.translations.map((translation) => translation.locale));

  if (receivedLocales.size !== 3 || [...expectedLocales].some((locale) => !receivedLocales.has(locale as Translation["locale"]))) {
    blockers.push("Page must contain exactly en, ms, and zh-Hans translations");
  }
  if (!page.pageConfig.disclosure || !/affiliate|commission|komisen|联盟|佣金/i.test(page.pageConfig.disclosure)) {
    blockers.push("Page config needs a clear affiliate disclosure");
  }

  const activeOffers = page.affiliateLinks.filter((offer) => offer.isActive);
  if (activeOffers.length === 0) blockers.push("At least one active affiliate offer is required");
  for (const offer of activeOffers) {
    if (!offer.merchantName?.trim() || !offer.anchorText?.trim()) {
      blockers.push(`${offer.id}: active offers need merchantName and anchorText`);
    }
    if (!validHttps(offer.destinationUrl) || !validHttps(offer.trackingUrl || "") || offer.destinationUrl === offer.trackingUrl) {
      blockers.push(`${offer.id}: active offers need distinct HTTPS destination and tracking URLs`);
    }
    if (!offer.sourceUrls?.length) blockers.push(`${offer.id}: missing source URLs`);
    const hasPrimarySource = offer.sourceUrls?.some((source) => !/shopee\.com\.my\/product/i.test(source.url));
    if (!hasPrimarySource) warnings.push(`${offer.id}: listing-only offer needs explicit uncertainty in article copy`);
  }

  for (const translation of page.translations) {
    if (![translation.title, translation.slug, translation.metaTitle, translation.metaDescription, translation.quickAnswer, translation.body].every((value) => typeof value === "string" && value.trim())) {
      blockers.push(`${translation.locale}: missing required translation copy`);
    }
    if (!Array.isArray(translation.keyTakeaways) || translation.keyTakeaways.length < 3) {
      blockers.push(`${translation.locale}: needs at least 3 key takeaways`);
    }
    const images = [translation.heroImageUrl, ...translation.sections.map((section) => section.sectionImageUrl)].filter(Boolean);
    if (new Set(images).size !== images.length) blockers.push(`${translation.locale}: repeated image URL`);
    if (translation.sections.length < 5) blockers.push(`${translation.locale}: needs at least 5 decision sections`);
    if (translation.faqItems.length < 4) blockers.push(`${translation.locale}: needs at least 4 buyer FAQs`);
    const minimumArticleLength = translation.locale === "zh-Hans" ? 1500 : 3600;
    if (articleLength(translation) < minimumArticleLength) blockers.push(`${translation.locale}: full article copy is too short for long-form standard`);
    const links = readInternalLinks(articleText(translation));
    if (links.length < 2) blockers.push(`${translation.locale}: needs at least 2 internal article links`);
    for (const link of links) {
      const prefix = localePaths[translation.locale];
      if (!link.startsWith(`${prefix}/blog/`)) blockers.push(`${translation.locale}: internal link uses the wrong locale: ${link}`);
      const slug = link.split("/").at(-1) || "";
      if (!existingSlugs.has(slug)) blockers.push(`${translation.locale}: internal link target does not exist: ${link}`);
    }
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

function queue(args: Record<string, string | boolean>) {
  const count = Number(stringArg(args, "count") || 4);
  if (!Number.isInteger(count) || count < 1) throw new Error("--count must be a positive integer");
  const candidates = pages().filter((page) => page.status === "draft" && !isResearched(page)).slice(0, count);
  const output = candidates.map((page) => ({
    id: page.id,
    slug: page.slug,
    primaryKeyword: page.pageConfig.primaryKeyword,
    category: page.pageConfig.category,
    useCase: page.pageConfig.useCase,
    offers: page.affiliateLinks.filter((offer) => offer.isActive).map((offer) => ({
      id: offer.id,
      destinationUrl: offer.destinationUrl,
      trackingUrl: offer.trackingUrl,
      sources: offer.sourceUrls,
    })),
  }));
  const out = stringArg(args, "out");
  if (out) writeFileSync(path.resolve(root, out), `${JSON.stringify({ articles: output }, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ requested: count, returned: output.length, articles: output }, null, 2)}\n`);
}

function brief(args: Record<string, string | boolean>) {
  const id = stringArg(args, "id");
  if (!id) throw new Error("brief requires --id");
  const page = pages().find((item) => item.id === id || item.slug === id || item.translations.some((translation) => translation.slug === id));
  if (!page) throw new Error(`Page not found: ${id}`);
  const related = pages().filter((item) => item.slug !== page.slug).slice(0, 8).map((item) => ({
    en: item.translations.find((translation) => translation.locale === "en")?.slug,
    ms: item.translations.find((translation) => translation.locale === "ms")?.slug,
    zh: item.translations.find((translation) => translation.locale === "zh-Hans")?.slug,
  }));
  process.stdout.write(`${JSON.stringify({ page, related }, null, 2)}\n`);
}

function validate(args: Record<string, string | boolean>) {
  const file = stringArg(args, "file");
  if (!file) throw new Error("validate requires --file");
  const result = audit(inputPage(file));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

function promote(args: Record<string, string | boolean>) {
  const id = stringArg(args, "id");
  const file = stringArg(args, "file");
  if (!id || !file) throw new Error("promote requires --id and --file");
  const page = inputPage(file);
  const result = audit(page);
  if (!result.valid) throw new Error(`Pipeline validation failed: ${result.blockers.join("; ")}`);
  if (page.status !== "published") throw new Error("Promotion file must set status to published");
  if (!args.prod || !args.yes) throw new Error("Production promotion requires --prod --yes");
  const command = spawnSync("bun", ["run", "seo", "edit-post", "--id", id, "--file", file, "--prod", "--yes"], { cwd: root, stdio: "inherit" });
  if (command.status !== 0) process.exitCode = command.status || 1;
  else notifySearchEngines();
}

function notifySearchEngines() {
  run("node", ["scripts/indexing.mjs", "validate-live", "--base-url", "https://www.launcher.my", "--wait", "300"]);
  run("node", ["scripts/indexing.mjs", "submit-google", "--optional"]);
  run("node", ["scripts/indexing.mjs", "submit-indexnow", "--optional"]);
}

function promoteReady(args: Record<string, string | boolean>) {
  const currentPages = pages();
  const ready = currentPages.filter((page) => page.status === "draft" && isResearched(page) && audit(page).valid);
  const summary = { readyGroups: ready.length, localizedUrls: ready.length * 3, slugs: ready.map((page) => page.slug) };

  if (!args.prod) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }
  if (!args.yes) throw new Error("Production bulk promotion requires --yes");
  if (ready.length === 0) throw new Error("No validated draft groups are ready for promotion");
  if (run("git", ["branch", "--show-current"], true) !== "master") throw new Error("Production promotion requires master");
  if (run("git", ["status", "--porcelain=v1", "--untracked-files=all"], true)) throw new Error("Production promotion requires a clean worktree");
  run("git", ["fetch", "origin", "master"]);
  if (run("git", ["rev-list", "--left-right", "--count", "origin/master...HEAD"], true) !== "0\t0") {
    throw new Error("Local master must exactly match origin/master");
  }
  run("git", ["push", "--dry-run", "origin", "HEAD:master"]);

  const original = readFileSync(pagesPath, "utf8");
  const readyIds = new Set(ready.map((page) => page.id));
  const nextPages = currentPages.map((page) => readyIds.has(page.id) ? { ...page, status: "published" as const } : page);
  let committed = false;
  try {
    writeFileSync(pagesPath, `${JSON.stringify(nextPages, null, 2)}\n`, "utf8");
    run("npm", ["run", "build"]);
    const changed = run("git", ["status", "--porcelain=v1", "--untracked-files=all"], true).split("\n").filter(Boolean).map((line) => line.slice(2).trim());
    if (changed.length !== 1 || changed[0] !== "data/pages.json") throw new Error(`Unexpected changed files: ${changed.join(", ")}`);
    run("git", ["add", "--", "data/pages.json"]);
    run("git", ["commit", "-m", `content: publish ${ready.length} researched article groups`, "--", "data/pages.json"]);
    committed = true;
    run("git", ["push", "origin", "HEAD:master"]);
    notifySearchEngines();
    process.stdout.write(`${JSON.stringify({ ...summary, production: true, commitSha: run("git", ["rev-parse", "HEAD"], true) }, null, 2)}\n`);
  } catch (error) {
    if (!committed) writeFileSync(pagesPath, original, "utf8");
    throw error;
  }
}

function help() {
  console.log(`Content pipeline

Commands:
  bun run content-pipeline queue --count 4 --out /tmp/launcher-batch.json
  bun run content-pipeline brief --id <draft-slug>
  bun run content-pipeline validate --file /tmp/article.json
  bun run content-pipeline promote --id <draft-slug> --file /tmp/article.json --prod --yes
  bun run content-pipeline promote-ready [--prod --yes]

Promotion invokes the protected seo edit-post publisher. It validates long-form depth,
affiliate tracking, source coverage, image diversity, and localized internal links first.`);
}

const { args, positional } = parseArgs(process.argv.slice(2));
const command = positional[0];
if (command === "queue") queue(args);
else if (command === "brief") brief(args);
else if (command === "validate") validate(args);
else if (command === "promote") promote(args);
else if (command === "promote-ready") promoteReady(args);
else help();
