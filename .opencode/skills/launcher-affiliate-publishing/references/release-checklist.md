# Release Checklist

## Content

- Three complete locales: `en`, `ms`, `zh-Hans`.
- Unique route-safe localized slugs.
- No fabricated claims, testing, prices, ratings, stock, or quotes.
- Current verification dates are visible.
- Methodology and limitations are explicit.
- Affiliate disclosure is localized and clear.

## Offers

- Every active offer has a distinct HTTPS affiliate tracking URL.
- `rel` contains `sponsored nofollow noopener`.
- Normal product URL is retained only for provenance.
- Public purchase links resolve through affiliate tracking.
- Official evidence links remain direct.
- CTA text is localized.

## Images

- Every hero, section, and offer image is relevant to the exact product.
- No cubes, initials, letters, unrelated stock, or cross-model substitutions.
- Every monetized editorial/product image is clickable through affiliate tracking.
- Missing verified images result in omitted image blocks, not placeholders.

## CLI And Build

- Run `bun run seo audit-page --id <slug>` for local imported content when applicable.
- Confirm zero audit blockers.
- Run `npm run build` for presentation/code changes.
- Use production CRUD for the final content mutation.
- Confirm the production command outputs a commit SHA.
- Confirm Vercel deployment for that SHA reaches `READY`.
- Confirm `git status --short --branch` is clean.

## Browser Checks

For presentation, image, or link changes, verify:

- all localized routes return `200`;
- correct `<html lang>` per locale;
- no direct merchant product anchors when tracking exists;
- no initial or cube image placeholders;
- product images load and are wrapped by tracked links;
- localized CTA and disclosure appear;
- no browser console errors;
- mobile persistent CTA does not prevent reading or navigation.
