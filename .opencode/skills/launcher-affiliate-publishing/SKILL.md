---
name: launcher-affiliate-publishing
description: Use whenever an agent publishes, edits, replaces images or affiliate links, reads, audits, or removes Launcher production posts. Covers the complete research-to-trilingual-content-to-Git-to-Vercel workflow in /Users/wy/Documents/launcher/launcher-app and should trigger for product batches, Shopee links, content CRUD, production publishing, and article maintenance.
---

# Launcher Affiliate Publishing

Operate the Launcher production content pipeline from:

`/Users/wy/Documents/launcher/launcher-app`

Production content lives in `data/pages.json`, deploys from GitHub `master`, and is served at `https://www.launcher.my`.

## Read First

- New product or post: `references/product-to-post.md`
- Publish, read, edit, or remove: `references/production-crud.md`
- Full page and offer fields: `references/content-contract.md`
- Final validation: `references/release-checklist.md`

Also load the existing `launcher` skill for APAC editorial, localization, SEO, and compliance context. Use `launcher-content-marketing` when the task includes hooks, social drafts, or campaign content.

## Non-Negotiable Rules

1. Publish only pages with real affiliate tracking URLs for every active commercial offer.
2. Keep normal merchant product URLs in data for provenance, but never expose them as public product links when a tracking URL exists.
3. Use official or authorized product images stored in page data. Never substitute Launcher cubes, merchant initials, generated letters, or unrelated stock images.
4. Ensure every editorial/product image on a monetized page resolves to the relevant affiliate URL.
5. Keep official documentation and policy sources direct; they are evidence links, not purchase links.
6. Do not invent prices, stock, sales, ratings, commissions, specifications, testing, expert quotes, scarcity, or personal experience.
7. Record prices, commissions, and terms as dated snapshots.
8. Localize independently for English, Bahasa Malaysia, and Simplified Chinese with unique slugs.
9. Include clear localized affiliate disclosure. Payout cannot determine editorial conclusions.
10. Never bypass CLI guards, force-push, skip the build, or manually edit production through Vercel's filesystem.

## Standard Flow

1. Inspect `data/affiliate-products-shopee-my.json` and existing posts.
2. Verify merchant links, tracking links, images, specifications, policies, and prices.
3. Create or export one complete page JSON under `/tmp`, outside the repository.
4. Validate content, localization, images, affiliate links, and claims.
5. Run the appropriate production CRUD command with `--prod --yes`.
6. Wait for the matching Vercel production deployment to become `READY`.
7. Verify localized routes in a browser when the task changes presentation or links.
8. Report URLs, commit SHA, audit status, and material caveats.

## Production Boundary

GitHub write access is the publisher authorization boundary. Production commands require:

- clean worktree and index;
- local `master` exactly synchronized with `origin/master`;
- successful GitHub push dry run;
- valid affiliate-only published pages;
- zero audit blockers;
- successful Next.js production build;
- a commit containing only `data/pages.json`;
- non-force push to `origin master`.

If any precondition fails, fix the cause rather than weakening the guard.
