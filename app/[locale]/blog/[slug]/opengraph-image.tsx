import { ImageResponse } from "next/og";
import { getPostByIdOrSlug } from "@/lib/db";
import { resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";

export const alt = "launcher product comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const localeLabel = {
  en: "Independent comparison",
  ms: "Perbandingan bebas",
  "zh-Hans": "独立比较指南",
} as const;

export default async function ArticleOpenGraphImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const localeCode = resolveLocaleCodeFromSegment(locale) || "en";
  const post = await getPostByIdOrSlug(slug);
  const translation = post ? resolveTranslationForLocale(post, localeCode) : null;
  const title = translation?.title || "launcher product guide";

  return new ImageResponse(
    (
      <div style={{ background: "white", color: "black", display: "flex", height: "100%", padding: 64, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
            <div style={{ alignItems: "center", background: "black", borderRadius: 18, color: "white", display: "flex", fontSize: 42, height: 76, justifyContent: "center", width: 76 }}>L</div>
            <div style={{ fontSize: 42, fontWeight: 600 }}>launcher</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ color: "#525252", fontSize: 28 }}>{localeLabel[localeCode]}</div>
            <div style={{ fontSize: 68, fontWeight: 500, letterSpacing: -2, lineHeight: 1.08 }}>{title}</div>
          </div>
          <div style={{ color: "#737373", fontSize: 25 }}>Malaysia · Singapore · Transparent tradeoffs</div>
        </div>
      </div>
    ),
    size,
  );
}
