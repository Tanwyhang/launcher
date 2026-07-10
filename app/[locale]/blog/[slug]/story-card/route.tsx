import { ImageResponse } from "next/og";
import { getPostByIdOrSlug } from "@/lib/db";
import { resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";

const size = { width: 1080, height: 1920 };

const label = {
  en: "A launcher knowledge cube",
  ms: "Knowledge cube daripada launcher",
  "zh-Hans": "launcher 知识 cube",
} as const;

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const localeCode = resolveLocaleCodeFromSegment(locale) || "en";
  const post = await getPostByIdOrSlug(slug);
  const title = post?.status === "published" ? resolveTranslationForLocale(post, localeCode).title : "launcher";

  return new ImageResponse(
    <div style={{ background: "white", color: "black", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: 96, width: "100%" }}>
      <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
        <div style={{ alignItems: "center", background: "black", borderRadius: 24, color: "white", display: "flex", fontSize: 54, height: 100, justifyContent: "center", width: 100 }}>L</div>
        <div style={{ fontSize: 52, fontWeight: 600 }}>launcher</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 38 }}>
        <div style={{ color: "#737373", fontSize: 34 }}>{label[localeCode]}</div>
        <div style={{ fontSize: 88, fontWeight: 500, letterSpacing: -3, lineHeight: 1.05 }}>{title}</div>
        <div style={{ background: "black", borderRadius: 50, color: "white", display: "flex", fontSize: 32, padding: "20px 32px" }}>Read the cube</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 30 }}>Malaysia · Singapore</div>
        <div style={{ color: "#737373", fontSize: 28 }}>Independent comparisons · Transparent tradeoffs</div>
      </div>
    </div>,
    size,
  );
}
