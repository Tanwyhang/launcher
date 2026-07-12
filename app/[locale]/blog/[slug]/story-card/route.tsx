import { ImageResponse } from "next/og";
import { getPostByIdOrSlug } from "@/lib/db";
import { getPostCoverImage, resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";

const size = { width: 1080, height: 1920 };

const copy = {
  en: {
    eyebrow: "Independent buyer guide",
    read: "Read the full comparison",
    region: "Malaysia + Singapore",
  },
  ms: {
    eyebrow: "Panduan pembeli bebas",
    read: "Baca perbandingan penuh",
    region: "Malaysia + Singapura",
  },
  "zh-Hans": {
    eyebrow: "独立选购指南",
    read: "阅读完整比较",
    region: "马来西亚 + 新加坡",
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
  const summary = shorten(translation?.quickAnswer || "Independent comparisons with transparent tradeoffs.", localeCode === "zh-Hans" ? 110 : 245);
  const takeaway = translation?.keyTakeaways[0];
  const logoUrl = new URL("/logo.png", request.url).toString();
  const coverImageUrl = post?.status === "published"
    ? new URL(getPostCoverImage(post, localeCode), request.url).toString()
    : new URL("/cube-launcher-mark.png", request.url).toString();

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f5f4f1",
        color: "#121212",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #dedbd4",
          borderRadius: 54,
          boxShadow: "0 24px 60px rgba(20, 20, 20, 0.11)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: 850,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", padding: "48px 52px 40px" }}>
          <div style={{ alignItems: "center", background: "#111", borderRadius: 28, display: "flex", height: 82, justifyContent: "center", width: 82 }}>
            <img alt="" height="50" src={logoUrl} style={{ filter: "invert(1)", objectFit: "contain" }} width="50" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>launcher</div>
            <div style={{ color: "#77736d", fontSize: 23 }}>{labels.eyebrow}</div>
          </div>
          <div style={{ color: "#77736d", display: "flex", fontSize: 34, marginLeft: "auto", marginTop: -22 }}>•••</div>
        </div>

        <div style={{ background: "white", display: "flex", height: 566, overflow: "hidden", padding: "0 52px", width: "100%" }}>
          <img alt="" height="566" src={coverImageUrl} style={{ borderRadius: 30, height: "100%", objectFit: "cover", width: "100%" }} width="746" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "48px 52px 54px" }}>
          <div style={{ color: "#77736d", fontSize: 23, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>{labels.region}</div>
          <div style={{ fontSize: 52, fontWeight: 750, letterSpacing: -1.8, lineHeight: 1.1, marginTop: 20 }}>{title}</div>
          <div style={{ color: "#55514c", fontSize: 27, lineHeight: 1.48, marginTop: 26 }}>{summary}</div>
          {takeaway ? (
            <div style={{ borderLeft: "5px solid #111", color: "#222", display: "flex", fontSize: 25, lineHeight: 1.4, marginTop: 28, paddingLeft: 20 }}>{shorten(takeaway, localeCode === "zh-Hans" ? 70 : 130)}</div>
          ) : null}
          <div style={{ alignItems: "center", borderTop: "1px solid #e5e2dc", display: "flex", marginTop: 34, paddingTop: 28 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{labels.read}</div>
            <div style={{ alignItems: "center", background: "#111", borderRadius: 24, color: "white", display: "flex", fontSize: 27, height: 48, justifyContent: "center", marginLeft: "auto", width: 48 }}>→</div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
