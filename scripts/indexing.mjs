import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const command = args[0];

function option(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function has(name) {
  return args.includes(`--${name}`);
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function publishedPages() {
  return JSON.parse(readFileSync(new URL("../data/pages.json", import.meta.url), "utf8")).filter((page) => page.status === "published");
}

function auditContent() {
  const pages = publishedPages();
  const errors = [];
  const warnings = [];
  const titles = new Map();
  const descriptions = new Map();

  for (const page of pages) {
    for (const translation of page.translations) {
      const key = `${translation.locale}:${translation.metaTitle.toLowerCase()}`;
      const descriptionKey = `${translation.locale}:${translation.metaDescription.toLowerCase()}`;
      if (titles.has(key)) errors.push(`Duplicate meta title: ${translation.metaTitle}`);
      else titles.set(key, page.slug);
      if (descriptions.has(descriptionKey)) errors.push(`Duplicate meta description: ${page.slug}/${translation.locale}`);
      else descriptions.set(descriptionKey, page.slug);
      if (translation.sections.length < 5) warnings.push(`${page.slug}/${translation.locale}: fewer than 5 sections`);
      if (translation.faqItems.length < 4) warnings.push(`${page.slug}/${translation.locale}: fewer than 4 FAQs`);
      const text = [translation.body, ...translation.sections.map((section) => section.sectionBody)].join(" ");
      const internalLinks = Array.from(text.matchAll(/\]\(\/(?:en|my|zh)\/blog\//g)).length;
      if (internalLinks < 2) warnings.push(`${page.slug}/${translation.locale}: fewer than 2 internal article links`);
    }
  }

  console.log(JSON.stringify({ publishedGroups: pages.length, localizedPages: pages.length * 3, errors, warnings }, null, 2));
  if (errors.length) process.exitCode = 1;
}

async function fetchWithRetry(url, waitSeconds) {
  const deadline = Date.now() + waitSeconds * 1000;
  let lastError;
  do {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 10000));
  } while (true);
  throw lastError;
}

async function validateLive() {
  const baseUrl = option("base-url", process.env.SITE_URL || "https://www.launcher.my").replace(/\/$/, "");
  const waitSeconds = Number(option("wait", "0"));
  const [sitemapResponse, robotsResponse] = await Promise.all([
    fetchWithRetry(`${baseUrl}/sitemap.xml`, waitSeconds),
    fetchWithRetry(`${baseUrl}/robots.txt`, waitSeconds),
  ]);
  const sitemap = await sitemapResponse.text();
  const robots = await robotsResponse.text();
  const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  const invalidHosts = urls.filter((url) => new URL(url).hostname !== new URL(baseUrl).hostname);
  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
  const errors = [];
  if (!urls.length) errors.push("Sitemap contains no URLs");
  if (invalidHosts.length) errors.push(`Unexpected sitemap hosts: ${invalidHosts.join(", ")}`);
  if (duplicates.length) errors.push(`Duplicate sitemap URLs: ${[...new Set(duplicates)].join(", ")}`);
  if (!robots.includes(`${baseUrl}/sitemap.xml`)) errors.push("robots.txt does not reference the canonical sitemap");
  console.log(JSON.stringify({ baseUrl, sitemapUrls: urls.length, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

async function googleAccessToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(privateKey.replace(/\\n/g, "\n"), "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed: ${response.status} ${await response.text()}`);
  return (await response.json()).access_token;
}

async function submitGoogle() {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!email || !privateKey) {
    if (has("optional")) return console.log("Google sitemap submission skipped: credentials are not configured");
    throw new Error("Set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY");
  }
  const baseUrl = option("base-url", process.env.SITE_URL || "https://www.launcher.my").replace(/\/$/, "");
  const property = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || "sc-domain:launcher.my";
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const token = await googleAccessToken(email, privateKey);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, { method: "PUT", headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Search Console sitemap submission failed: ${response.status} ${await response.text()}`);
  console.log(JSON.stringify({ submitted: sitemapUrl, property }, null, 2));
}

async function listGoogleSites() {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!email || !privateKey) throw new Error("Set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY");
  const token = await googleAccessToken(email, privateKey);
  const response = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Search Console site listing failed: ${response.status} ${await response.text()}`);
  console.log(JSON.stringify(await response.json(), null, 2));
}

async function submitIndexNow() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    if (has("optional")) return console.log("IndexNow skipped: INDEXNOW_KEY is not configured");
    throw new Error("Set INDEXNOW_KEY");
  }
  const baseUrl = option("base-url", process.env.SITE_URL || "https://www.launcher.my").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/sitemap.xml`);
  if (!response.ok) throw new Error(`Could not load sitemap: ${response.status}`);
  const xml = await response.text();
  const urlList = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  const payload = {
    host: new URL(baseUrl).hostname,
    key,
    keyLocation: process.env.INDEXNOW_KEY_LOCATION || `${baseUrl}/${key}.txt`,
    urlList,
  };
  const submit = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!submit.ok && submit.status !== 202) throw new Error(`IndexNow failed: ${submit.status} ${await submit.text()}`);
  console.log(JSON.stringify({ submittedUrls: urlList.length, status: submit.status }, null, 2));
}

if (command === "audit-content") auditContent();
else if (command === "validate-live") await validateLive();
else if (command === "submit-google") await submitGoogle();
else if (command === "list-google-sites") await listGoogleSites();
else if (command === "submit-indexnow") await submitIndexNow();
else {
  console.log(`Indexing automation

  npm run indexing -- audit-content
  npm run indexing -- validate-live --base-url https://www.launcher.my --wait 300
  npm run indexing -- submit-google [--optional]
  npm run indexing -- list-google-sites
  npm run indexing -- submit-indexnow [--optional]`);
}
