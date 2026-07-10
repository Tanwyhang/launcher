import { ImageResponse } from "next/og";
import { getPostByIdOrSlug } from "@/lib/db";
import { resolveLocaleCodeFromSegment, resolveTranslationForLocale } from "@/lib/public-blog";

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
  const heroImageUrl = translation?.heroImageUrl;
  const logoUrl = new URL("/logo.png", request.url).toString();

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f3f1ec",
        color: "#121212",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ background: "#e6e2d8", borderRadius: 56, height: 480, left: -210, position: "absolute", top: 160, transform: "rotate(-7deg)", width: 420 }} />
      <div style={{ background: "#e9e5dc", borderRadius: 56, height: 520, position: "absolute", right: -250, top: 650, transform: "rotate(8deg)", width: 450 }} />
      <div style={{ background: "#e4e0d6", borderRadius: 56, bottom: 70, height: 390, left: -170, position: "absolute", transform: "rotate(5deg)", width: 390 }} />

      <div
        style={{
          background: "white",
          border: "1px solid #dedbd4",
          borderRadius: 54,
          boxShadow: "0 32px 80px rgba(20, 20, 20, 0.17)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: 850,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", padding: "42px 46px 34px" }}>
          <div style={{ alignItems: "center", background: "#111", borderRadius: 28, display: "flex", height: 82, justifyContent: "center", width: 82 }}>
            <img alt="" height="50" src={logoUrl} style={{ filter: "invert(1)", objectFit: "contain" }} width="50" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>launcher</div>
            <div style={{ color: "#77736d", fontSize: 23 }}>{labels.eyebrow}</div>
          </div>
          <div style={{ color: "#77736d", display: "flex", fontSize: 34, marginLeft: "auto", marginTop: -22 }}>•••</div>
        </div>

        {heroImageUrl ? (
          <div style={{ background: "#dedbd4", display: "flex", height: 610, overflow: "hidden", width: "100%" }}>
            <img alt="" height="610" src={heroImageUrl} style={{ height: "100%", objectFit: "cover", width: "100%" }} width="850" />
          </div>
        ) : (
          <div style={{ alignItems: "center", background: "#181818", color: "white", display: "flex", fontSize: 120, height: 610, justifyContent: "center", width: "100%" }}>L</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", padding: "42px 48px 48px" }}>
          <div style={{ color: "#77736d", fontSize: 23, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>{labels.region}</div>
          <div style={{ fontSize: 54, fontWeight: 750, letterSpacing: -1.8, lineHeight: 1.08, marginTop: 18 }}>{title}</div>
          <div style={{ color: "#55514c", fontSize: 28, lineHeight: 1.45, marginTop: 24 }}>{summary}</div>
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
