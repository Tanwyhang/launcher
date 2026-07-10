## launcher

Trilingual APAC product decision guides and a CMS-oriented publishing foundation.

- one React-Admin back office at `/admin`
- one repeatable page architecture: `best-x-for-y-in-z`
- one locale-specific public URL tree per translation (`/en`, `/my`, `/zh`)
- structured editorial and affiliate offer slots
- section blocks, takeaways, FAQ, and disclosure fields per page
- optional Supabase persistence plus local content mode
- localized metadata, canonical URLs, hreflang and social images
- BlogPosting, FAQPage, ItemList, BreadcrumbList, Organization and WebSite JSON-LD
- favicon, Apple icon, web app manifest, robots and sitemap routes

### Setup

1. Install dependencies

```bash
bun install
```

2. Copy env template

```bash
cp .env.local.example .env.local
```

3. Fill your Supabase values in `.env.local` if you want persistence/storage:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPLOAD_AUTH_TOKEN`
- `NEXT_PUBLIC_MEDIA_BUCKET`
- `ADMIN_LOGIN_ID`
- `ADMIN_LOGIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`
- `NEXT_PUBLIC_SITE_URL` for a custom production domain; Vercel's production URL is detected automatically

4. Run

```bash
bun run dev
```

### Main routes

- `GET /` rollout overview
- `GET /en/blog`, `GET /my/blog`, `GET /zh/blog` localized article indexes
- `GET /en/blog/[slug]`, `GET /my/blog/[slug]`, `GET /zh/blog/[slug]` localized public SEO pages
- `GET /admin` React-Admin CMS for the page template
- `GET /api/admin/pages` list pages for admin
- `GET /api/admin/pages/[id]` fetch one page for admin
- `PUT /api/admin/pages/[id]` save one page for admin
- `POST /api/media/upload` upload image file and return URL

### SEO CLI

Use the internal operator CLI to scaffold and audit pages:

```bash
bun run seo audit-page --id best-ai-note-takers-for-meetings

bun run seo create-page \
  --category "AI note takers" \
  --use-case "sales teams" \
  --market "Malaysia" \
  --keyword "best ai note takers for sales teams malaysia" \
  --slug-en best-ai-note-takers-for-sales-teams-malaysia \
  --slug-ms ai-note-taker-terbaik-untuk-sales-team-malaysia \
  --slug-zh malaysia-sales-team-ai-note-taker

bun run seo clone-page \
  --source best-ai-note-takers-for-meetings \
  --slug-en best-ai-note-takers-for-recruiters-singapore \
  --slug-ms ai-note-taker-terbaik-untuk-recruiters-singapura \
  --slug-zh singapore-recruiter-ai-note-taker \
  --market "Singapore" \
  --use-case "recruiters" \
  --keyword "best ai note takers for recruiters singapore"

bun run seo import-pages \
  --file data/seed-pages-first-topic-cluster.json
```

Current commands:

- `create-page`
- `clone-page`
- `assign-offers` (requires an operator-provided JSON file)
- `import-pages`
- `audit-page`

### Current page model

Each page stores:

- shared page strategy in `posts.page_config`
  - `templateKey`, `category`, `useCase`, `market`, `primaryKeyword`, `disclosure`
- locale fields in `post_translations`
  - `slug`, `title`, `meta_title`, `meta_description`, `quick_answer`, `hero_image_url`, `key_takeaways`, `sections`, `faq_items`, `body`
- offer slots in `affiliate_links`
  - merchant, anchor/product, CTA labels, `summary`, `best_for`, `price_band`, `score`, URLs

### Admin UX

The admin now uses React-Admin and keeps the multilingual editing model by showing:

- shared template strategy fields
- three locale columns side by side
- structured offer slot management

Public locale mapping:

- `en` content publishes under `/en/...`
- `ms` content publishes under `/my/...`
- `zh-Hans` content publishes under `/zh/...`

### Local fallback

If Supabase env vars are missing, public content is read from `data/pages.json`. Vercel's filesystem is not used as a persistent CMS; configure Supabase before enabling production editing.

### Publishing integrity

- Do not publish placeholder merchants, scores, prices, stock, reviews, or testing claims.
- Direct official links are not described as affiliate links.
- Monetized links must be disclosed and use `sponsored nofollow noopener`.
- The SEO scorer is a pre-publish lint tool, not a guarantee of rankings, citations, or traffic.

### Supabase schema expectation

See `supabase-schema.sql` for the latest bootstrap schema. The important tables are:

- `posts`
- `post_translations`
- `affiliate_links`

You can bootstrap a local table set by running the SQL in `supabase-schema.sql`.
