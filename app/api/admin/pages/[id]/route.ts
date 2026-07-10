import { NextResponse } from "next/server";
import { getPostByIdOrSlug, savePost } from "@/lib/db";
import { hasAdminSession } from "@/lib/admin-security";
import type { AffiliateLinkDraft, PageConfigDraft, TranslationDraft } from "@/lib/sample-data";

type IncomingPayload = {
  slug?: string;
  status?: "draft" | "published";
  pageConfig?: PageConfigDraft;
  translations?: TranslationDraft[];
  affiliateLinks?: AffiliateLinkDraft[];
};

function validatePayload(body: IncomingPayload): string | null {
  if (!body || !Array.isArray(body.translations)) {
    return "Invalid payload";
  }

  const seenLocales = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const translation of body.translations) {
    if (!translation.locale) {
      return "Each translation must include a locale";
    }

    if (seenLocales.has(translation.locale)) {
      return `Duplicate locale: ${translation.locale}`;
    }

    seenLocales.add(translation.locale);

    const localizedSlug = translation.slug?.trim();

    if (!localizedSlug) {
      return `Missing slug for locale: ${translation.locale}`;
    }

    if (seenSlugs.has(localizedSlug)) {
      return `Duplicate localized slug: ${localizedSlug}`;
    }

    seenSlugs.add(localizedSlug);
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await getPostByIdOrSlug(id);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getPostByIdOrSlug(id);

  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = (await request.json()) as IncomingPayload;
  const validationError = validatePayload(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const saved = await savePost({
      id,
      slug: body.slug || existing.slug,
      status: body.status || existing.status,
      pageConfig: body.pageConfig || existing.pageConfig,
      translations: body.translations || existing.translations,
      affiliateLinks: Array.isArray(body.affiliateLinks)
        ? body.affiliateLinks
        : existing.affiliateLinks,
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
