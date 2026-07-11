# Complete Page Contract

Production publish and edit use full replacement records. Do not send partial patches.

## Page

```json
{
  "id": "optional-on-input",
  "slug": "english-primary-slug",
  "status": "published",
  "pageConfig": {
    "templateKey": "best-x-for-y-in-z",
    "category": "Category",
    "useCase": "Specific buyer decision",
    "market": "Malaysia",
    "primaryKeyword": "primary query",
    "disclosure": "Explicit affiliate commission disclosure"
  },
  "translations": [],
  "affiliateLinks": []
}
```

## Translation

Exactly one each of `en`, `ms`, and `zh-Hans`:

```json
{
  "locale": "en",
  "title": "Localized title",
  "slug": "unique-localized-slug",
  "metaTitle": "Search title",
  "metaDescription": "Accurate search description",
  "quickAnswer": "Direct answer with dated factual context",
  "heroImageUrl": "https://official-or-authorized/image.jpg",
  "keyTakeaways": ["..."],
  "sections": [
    {
      "id": "stable-section-id",
      "sectionTitle": "Decision-focused heading",
      "sectionImageUrl": "https://official-or-authorized/image.jpg",
      "sectionBody": "Source-backed explanation"
    }
  ],
  "faqItems": [
    {
      "id": "stable-faq-id",
      "question": "Buyer question",
      "answer": "Source-backed answer"
    }
  ],
  "body": "Markdown methodology, disclosure, and conclusion"
}
```

## Affiliate Offer

```json
{
  "id": "stable-offer-id",
  "merchantName": "Merchant",
  "anchorText": "Product name",
  "destinationUrl": "https://normal-product-url-for-private-provenance",
  "trackingUrl": "https://affiliate-tracking-url",
  "imageUrl": "https://official-or-authorized/product-image.jpg",
  "imageLinkUrl": "https://affiliate-tracking-url",
  "sourceUrls": [
    { "label": "Official specifications", "url": "https://official-source" },
    { "label": "Merchant listing", "url": "https://normal-product-url" }
  ],
  "rel": "sponsored nofollow noopener noreferrer",
  "target": "_blank",
  "ctaTextEn": "Check current price",
  "ctaTextMs": "Semak harga terkini",
  "ctaTextZhHans": "查看最新价格",
  "summary": "Evidence-based summary",
  "bestFor": "Specific buyer fit",
  "notFor": "Specific limitation",
  "priceBand": "Dated price context",
  "displayedPrice": "RM0.00",
  "pricingSummary": "Price and variation caveats",
  "commissionRate": 0,
  "commissionSnapshot": "Internal dated provenance only",
  "verifiedAt": "YYYY-MM-DD",
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "score": 0,
  "isActive": true,
  "localizedContent": {
    "en": {},
    "ms": {},
    "zh-Hans": {}
  }
}
```

Every active published offer needs a distinct HTTPS `trackingUrl`. The public renderer routes merchant listing sources, images, cards, section CTAs, alternatives, structured product URLs, and mobile CTAs through it.

Official specifications, terms, policies, and coverage maps remain direct evidence links.

## Image Diversity

- `heroImageUrl` and each populated `sectionImageUrl` must be an exact verified product, merchant, operator, or official editorial asset relevant to that section.
- Do not reuse one image URL for every visual slot in an article.
- Missing verified assets mean the relevant image field remains empty. Never fill it with a Launcher asset, initials, generated placeholder, or unrelated stock image.
