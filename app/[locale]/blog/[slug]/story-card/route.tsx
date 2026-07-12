import { ImageResponse } from "next/og";
import { getPostByIdOrSlug } from "@/lib/db";
import { getPostCoverImage, resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";

const size = { width: 1080, height: 1920 };

const copy = {
  en: {
    eyebrow: "Independent buyer guide",
    read: "Full comparison",
  },
  ms: {
    eyebrow: "Panduan pembeli bebas",
    read: "Perbandingan penuh",
  },
  "zh-Hans": {
    eyebrow: "独立选购指南",
    read: "完整比较",
  },
} as const;

function shorten(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}...`;
}

export async function GET(request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const localeCode = resolveLocaleCodeFromSegment(locale) || "en";
  const post = await getPostByIdOrSlug(slug);
  const translation = post?.status === "published" ? resolveTranslationForLocale(post, localeCode) : null;
  const labels = copy[localeCode];
  const title = translation?.title || "launcher";
  const headline = shorten(post?.pageConfig.primaryKeyword || title, localeCode === "zh-Hans" ? 44 : 76);
  const takeaway = translation?.keyTakeaways[0];
  const readMinutes = Math.max(4, Math.ceil(`${translation?.body || ""} ${translation?.sections.map((section) => section.sectionBody).join(" ") || ""}`.split(/\s+/).filter(Boolean).length / 180));
  const logoUrl = new URL("/logo.png", request.url).toString();
  const visualImageUrl = translation?.heroImageUrl || (post?.status === "published" ? getPostCoverImage(post, localeCode) : "/cube-launcher-mark.png");
  const coverImageUrl = new URL(visualImageUrl, request.url).toString();

  return new ImageResponse(
    <div
      style={{ background: "#f6f5f2", color: "#121212", display: "flex", flexDirection: "column", height: "100%", padding: 64, width: "100%" }}
    >
      <div style={{ alignItems: "center", display: "flex" }}>
        <div style={{ alignItems: "center", background: "#111", borderRadius: 22, display: "flex", height: 66, justifyContent: "center", width: 66 }}>
          <img alt="" height="38" src={logoUrl} style={{ filter: "invert(1)", objectFit: "contain" }} width="38" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>launcher</div>
          <div style={{ color: "#77736d", fontSize: 19 }}>{labels.eyebrow}</div>
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 68, fontWeight: 750, letterSpacing: -2.8, lineHeight: 1.04, marginTop: 54 }}>{headline}</div>

      <div style={{ background: "white", borderRadius: 36, display: "flex", height: 660, marginTop: 48, overflow: "hidden", width: "100%" }}>
        <img alt="" height="660" src={coverImageUrl} style={{ height: "100%", objectFit: "cover", objectPosition: "center", width: "100%" }} width="952" />
      </div>

      {takeaway ? (
        <div style={{ borderLeft: "7px solid #111", color: "#222", display: "flex", fontSize: 38, fontWeight: 600, lineHeight: 1.26, marginTop: 48, paddingLeft: 28 }}>
          {shorten(takeaway, localeCode === "zh-Hans" ? 70 : 135)}
        </div>
      ) : null}

      <div style={{ color: "#68645f", display: "flex", fontSize: 25, marginTop: 38 }}>
        {post?.pageConfig.market || "Malaysia"} · {readMinutes} min read
      </div>

      <div style={{ alignItems: "center", borderTop: "1px solid #d9d5ce", display: "flex", marginTop: 64, paddingTop: 32 }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>{labels.read} → launcher.my</div>
      </div>
    </div>,
    size,
  );
}
