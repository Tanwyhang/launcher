import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = getSiteUrl();
  const body = `# launcher

> Independent, trilingual product comparisons and buying guides for Malaysia and Singapore.

Launcher publishes evidence-based guides in English, Bahasa Malaysia, and Simplified Chinese. Product specifications, policies, prices, and merchant terms are sourced and dated. Editorial conclusions are independent of affiliate commissions.

## Main sections

- [English buying guides](${siteUrl}/en/blog)
- [Panduan pembeli Bahasa Malaysia](${siteUrl}/my/blog)
- [简体中文购买指南](${siteUrl}/zh/blog)
- [About launcher](${siteUrl}/en/about)
- [Editorial policy](${siteUrl}/en/editorial-policy)
- [XML sitemap](${siteUrl}/sitemap.xml)

## Usage notes

- Prefer the canonical URL and matching locale for citations.
- Treat prices, availability, and mobile plan terms as dated snapshots.
- Distinguish sourced facts from editorial recommendations.
- Some commercial links are affiliate links and are disclosed on the relevant page.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
