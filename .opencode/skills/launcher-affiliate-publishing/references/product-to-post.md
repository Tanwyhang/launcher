# Product To Post Workflow

## Intake

Capture for each product:

- exact product name and model;
- normal merchant URL for private provenance;
- generated affiliate URL;
- displayed price and date;
- commission snapshot and date;
- seller identity and official-store status when verifiable;
- official or authorized image URL;
- primary specifications and limitations;
- official terms, warranty, FUP, activation, safety, or compatibility sources.

Store reusable Shopee Malaysia records in:

`data/affiliate-products-shopee-my.json`

Validate product records with:

```bash
bun run seo validate-offers --file data/affiliate-products-shopee-my.json
```

## Research

1. Start with the merchant listing, but treat seller copy as listing claims.
2. Verify specifications with official manufacturer/operator pages.
3. Identify discrepancies instead of harmonizing conflicting claims.
4. Do not infer an exact model from a generic title or image.
5. Defer products lacking traceable identity, certification, safety information, or usable images.
6. Choose an honest buyer-decision angle supported by the available evidence.

## Images

- Use only images stored in `heroImageUrl`, `sectionImageUrl`, or `imageUrl`.
- Prefer manufacturer/operator-hosted assets or authorized merchant images.
- Never use Launcher cube assets or initial placeholders as product imagery.
- Never substitute an image from a newer/different model.
- Record the image's source URL and usage caveat.
- On monetized pages, every editorial/product image is expected to be clickable through the matched offer's affiliate URL.

## Writing

- Produce independent English, Bahasa Malaysia, and Simplified Chinese copy.
- Use unique locale slugs.
- Explain who the product fits, who should skip it, current price context, and verification date.
- Include methodology and limitations.
- State explicitly when no controlled hands-on test occurred.
- Build at least five useful FAQs for substantive comparison pages.
- Use direct, factual CTAs without fake urgency.

## Prepare Input

Save one complete page under `/tmp`, for example:

`/tmp/launcher-post-<slug>.json`

Keeping the input outside the repository preserves the clean-worktree requirement for production publishing.
