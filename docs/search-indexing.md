# Search Indexing

Launcher uses supported discovery mechanisms for ordinary editorial pages:

1. Crawlable internal links.
2. Canonical and reciprocal `hreflang` metadata.
3. A dynamic sitemap containing published localized pages and real `updatedAt` dates.
4. One verified Google Search Console domain property with automated sitemap submission.
5. Optional IndexNow notification for Bing and participating engines.

Google's Indexing API is not used because Google limits it to qualifying `JobPosting` and livestream `BroadcastEvent` pages.

## GitHub Secrets

Add the service-account email as an owner or full user of the `sc-domain:launcher.my` Search Console property, then configure:

```text
GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
```

Optional IndexNow configuration:

```text
INDEXNOW_KEY
INDEXNOW_KEY_LOCATION
```

The IndexNow key must also be publicly retrievable from `INDEXNOW_KEY_LOCATION`.

Production `content-pipeline promote` and `promote-ready` commands automatically wait for the live sitemap, validate discovery files, submit the sitemap to Search Console when credentials exist, and notify IndexNow when configured. The GitHub workflow remains available for manual reruns.

## Commands

```bash
npm run indexing -- audit-content
npm run indexing -- validate-live --base-url https://www.launcher.my --wait 300
npm run indexing -- submit-google
npm run indexing -- submit-indexnow
```

Search Console submission improves discovery but does not guarantee indexing or ranking. Ranking depends on satisfying the query better than competing pages, source quality, originality, topical authority, links, engagement, and technical accessibility.

## Competitive Standard

- One primary query and distinct buyer decision per article.
- Source-backed facts and explicit uncertainty where product identity is incomplete.
- Unique titles and descriptions across each locale.
- At least two relevant localized internal article links.
- Exact verified images without repeated filler.
- Regular updates when prices, plans, specifications, or availability change.
- Earned external links through useful original comparisons, tools, datasets, and citations; never purchased or manufactured link schemes.
