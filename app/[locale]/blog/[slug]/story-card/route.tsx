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
  const takeaway = translation?.keyTakeaways[0];
  const readMinutes = Math.max(4, Math.ceil(`${translation?.body || ""} ${translation?.sections.map((section) => section.sectionBody).join(" ") || ""}`.split(/\s+/).filter(Boolean).length / 180));
  const logoUrl = new URL("/logo.png", request.url).toString();
  const visualImageUrl = post?.status === "published" ? getPostCoverImage(post, localeCode) : "/cube-launcher-mark.png";
  const coverImageUrl = new URL(visualImageUrl, request.url).toString();

  return new ImageResponse(
    <div
      style={{ alignItems: "center", background: "#f5f4f1", color: "#121212", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}
    >
      <div style={{ background: "white", border: "1px solid #dedbd4", borderRadius: 54, boxShadow: "0 24px 60px rgba(20, 20, 20, 0.11)", display: "flex", flexDirection: "column", overflow: "hidden", width: 850 }}>
        <div style={{ alignItems: "center", display: "flex", padding: "48px 52px 40px" }}>
          <div style={{ alignItems: "center", background: "#111", borderRadius: 28, display: "flex", height: 82, justifyContent: "center", width: 82 }}>
            <img alt="" height="50" src={logoUrl} style={{ filter: "invert(1)", objectFit: "contain" }} width="50" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 20 }}>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>launcher</div>
            <div style={{ display: "flex", color: "#77736d", fontSize: 23 }}>{labels.eyebrow}</div>
          </div>
        </div>

        <div style={{ background: "white", display: "flex", height: 560, overflow: "hidden", padding: "0 52px", width: "100%" }}>
          <img alt="" height="560" src={coverImageUrl} style={{ borderRadius: 30, height: "100%", objectFit: "cover", width: "100%" }} width="746" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "42px 52px 52px" }}>
          <div style={{ display: "flex", color: "#77736d", fontSize: 23, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
            {post?.pageConfig.market || "Malaysia"} · {readMinutes} min read
          </div>
          {takeaway ? (
            <div style={{ borderLeft: "5px solid #111", color: "#222", display: "flex", fontSize: 30, lineHeight: 1.35, marginTop: 26, paddingLeft: 20 }}>
              {shorten(takeaway, localeCode === "zh-Hans" ? 58 : 110)}
            </div>
          ) : null}
          <div style={{ alignItems: "center", borderTop: "1px solid #e5e2dc", display: "flex", marginTop: 34, paddingTop: 28 }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>{labels.read} → launcher.my</div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
