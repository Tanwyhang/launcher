---
name: seo-rollout-operator
description: Use when building or scaling launcher-app affiliate SEO pages, especially for repeating the best-x-for-y-in-z rollout, importing seeded pages, cloning winners, assigning offers, or auditing publish readiness.
---

# SEO Rollout Operator

Use this skill for the `launcher-app` workflow when the task is to create, clone, import, polish, or audit multilingual affiliate SEO pages.

## Goals

- Preserve the page system already in `launcher-app`
- Prefer CLI operations before manual content edits
- Keep all three locales wired to one grouped page record
- Make every public page publish-ready by default

## Current operator commands

Run from `launcher-app/`:

```bash
bun run seo create-page ...
bun run seo clone-page ...
bun run seo assign-offers --id <page-id-or-slug> --file <offers.json>
bun run seo import-pages --file <seed-pages.json>
bun run seo audit-page --id <page-id-or-slug>
```

## Default workflow

1. Check whether the page already exists with `audit-page` or by inspecting `data/pages.json`.
2. If creating from structured content, prefer `import-pages --file ...`.
3. If expanding from a winner, prefer `clone-page`.
4. If only commercial slots need updating, use `assign-offers`.
5. Run `audit-page` after every creation/import/update.
6. If audit warnings remain, fix the page data and rerun the audit.
7. Run `bun run build` before concluding substantial rollout work.

## Page quality standard

Every rollout page should include:

- locale-specific slug in all 3 locales
- meta title and meta description per locale
- quick answer
- key takeaways
- comparison-ready offer slots
- best for / not for
- pricing context
- pros / cons
- at least 2 sections
- at least 2 FAQ items
- disclosure

## Seed file pattern

Preferred seed file format:

```json
{
  "pages": [
    {
      "slug": "best-ai-voice-recorders-for-students",
      "status": "published",
      "pageConfig": { "templateKey": "best-x-for-y-in-z" },
      "translations": [],
      "affiliateLinks": []
    }
  ]
}
```

## Notes

- Local fallback persists to `data/pages.json`
- Admin reads the same page records as the CLI and public site
- Restart opencode after adding this skill if you want the runtime to surface it in future sessions
