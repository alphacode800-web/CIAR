# CIAR

**A bilingual super-platform for enterprise ecosystems — one codebase, fifteen business modules, and a CMS-grade admin panel that ships content without redeploys.**

CIAR is a production Next.js application that unifies a corporate portfolio, a multi-module business platform, marketplace commerce, and advertiser workflows under a single design system. Content, translations, banners, ads, and campaigns are persisted in PostgreSQL and surfaced through a typed service layer — so operators control the live site from the admin panel while engineers keep strict boundaries between UI, API routes, and data access.

<!-- Replace with a real screenshot or demo GIF -->
![CIAR Platform Preview](./public/logo.svg)
> **Demo media placeholder** — replace the image above with a 1440×900 screenshot or short GIF of the Super Platform home + Admin panel.

---

## Tech Stack & Key Highlights

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS 4 · shadcn/ui · Radix UI · Framer Motion |
| **Data** | Prisma 6 · PostgreSQL (Neon) |
| **Auth** | JWT · bcryptjs · role-based access (`USER` / `ADMIN` / `SELLER`) |
| **State & Data Fetching** | React Context · TanStack Query · Zustand |
| **Forms & Validation** | React Hook Form · Zod 4 |
| **AI** | `z-ai-web-dev-sdk` (chat, SEO, sentiment, recommendations) |
| **Email** | Resend (optional) · batched campaign delivery |
| **Deploy** | Netlify (`@netlify/plugin-nextjs`) · standalone output for self-host |

### Engineering highlights

- **Settings-driven CMS** — Hero banners, page headers, legal pages, news ticker, typography, and site ads live in a `Setting` key-value store with transactional upserts; no hardcoded marketing copy in components.
- **Super Platform module registry** — 15 seeded business modules (`PlatformModule` + `PlatformBanner`) with visibility rules, tri-image banners, and per-module listing tables — wired to a public homepage and dedicated platform detail routes.
- **Ad placement engine** — Slot-based placements (`slot_1` / `slot_2`) across four page regions, expiry-aware status, default-ad fallback, and an admin approval pipeline that merges DB submissions with a settings queue.
- **Layered i18n** — Five locales with RTL support, in-memory translation cache, DB overrides, English/admin fallbacks, and placeholder stripping so incomplete seed data never leaks into production UI.

---

## Core Features

- **Super Platform Home** — Module grid with localized banners, hero image carousels, and lazy-loaded project cards synced from the admin project cache; ad slots injected at defined breakpoints via `<SiteAdSlot />`.
- **Hash SPA Router** — Client-side `RouterProvider` maps `/#/projects`, `/#/platform/:slug`, `/#/ads`, and more without full reloads; real Next.js routes remain for `/admin/*` and `/api/*`.
- **Admin Command Center** — 20+ tabs (analytics, projects, media, ads, campaigns, AI, SEO, appearance, legal pages, section editors) with command palette search and live dashboard metrics.
- **Advertiser Workflow** — Structured product details (fabrics, sizes, pricing, WhatsApp, shipping, payment) submitted via Zod-validated forms; admins review, edit, approve, or reject before publish.
- **AI Operations** — Server-side AI client for chat assistance, SEO suggestions, sentiment analysis, fraud scanning, inventory insights, and AI-drafted email campaigns — all gated behind admin approval.
- **Email Campaigns** — Segment-based recipient resolution, batch sending with rate limits, personalization tokens, and send-stats tracking stored in settings.
- **JOMAA Store** — Product catalog, categories, orders, and seller roles — integrated into the same Prisma schema and admin surface.
- **Theme & Typography Engine** — `next-themes` dark/light mode plus admin-controlled font stacks (Geist, Changa, Cairo, Tajawal, and more) applied globally through CSS variables.
- **Project Portfolio** — Drag-and-drop reorder (`@dnd-kit`), multi-image galleries, per-locale translations, view tracking, and featured/published flags.

---

## Architecture & Folder Structure

```
ciar/
├── prisma/
│   ├── schema.prisma      # Projects, users, marketplace, ads, platform modules, settings
│   └── seed.ts            # Super Platform modules + default data
├── public/                # Static assets, logos, OG images
├── scripts/               # Post-build standalone packaging
└── src/
    ├── app/
    │   ├── api/           # REST handlers — auth, projects, ads, AI, admin, campaigns
    │   ├── admin/         # Next.js admin shell routes (/admin/panel/[tab])
    │   ├── layout.tsx     # Root providers (i18n, auth, router, theme, AI widget)
    │   └── page.tsx       # SPA entry — lazy-loaded page components + AnimatePresence
    ├── components/
    │   ├── admin/         # Tab panels (ads, campaigns, SEO, projects, settings…)
    │   ├── ads/           # Ad banners, slots, product-detail forms/cards
    │   ├── home/          # News ticker, AI recommendations, about brief
    │   ├── layout/        # Navbar, footer, auth modal, AI assistant widget
    │   ├── pages/         # Route-mapped page components (home, projects, advertise…)
    │   ├── super-platform/# Module home + platform detail views
    │   └── ui/            # shadcn/ui primitives (50+ Radix-backed components)
    ├── features/
    │   ├── ai/            # AI domain logic (chat, SEO, sentiment, campaign drafts)
    │   └── super-platform/# Server helpers for module/banner APIs
    ├── hooks/             # Shared React hooks
    ├── lib/               # Contexts, schemas, defaults, i18n, site-ads, utilities
    ├── schemas/           # Shared Zod schemas
    └── services/          # Data-access layer (projects, settings, ads, email campaigns)
```

### Patterns in use

| Pattern | Where | Why |
|---------|-------|-----|
| **Service layer** | `src/services/*` | API routes stay thin; business logic and Prisma access live in testable modules. |
| **Context providers** | `src/lib/*-context.tsx` | Auth, i18n, router, currency, and modal state scoped at the root layout. |
| **Settings as JSON blobs** | `site_ads_v1`, campaigns, tickers | Flexible document storage without schema migrations for CMS-like content. |
| **Lazy route components** | `src/app/page.tsx` | Code-splitting per page; skeleton fallbacks during chunk load. |
| **Feature folders** | `src/features/ai`, `super-platform` | Domain logic separated from presentational components. |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** database (local Docker or [Neon](https://neon.tech))
- Optional: **Resend API key** for live email campaigns

### Installation

```bash
# Clone
git clone https://github.com/alphacode800-web/CIAR.git
cd CIAR

# Install dependencies
npm install

# Environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, and optionally RESEND_API_KEY

# Database
npm run db:generate
npm run db:push
npm run db:seed        # optional — seeds Super Platform modules

# Development
npm run dev
# → http://localhost:3000
```

### Production build

```bash
npm run build
npm run start          # standalone server (non-Netlify)
```

On **Netlify**, the build pipeline runs `prisma generate`, `db push`, and `next build` automatically via `netlify.toml`.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `RESEND_API_KEY` | No | Enables real email delivery for campaigns |

---

## Key Engineering Challenges & Decisions

### 1. SPA navigation inside a Next.js App Router shell

**Problem.** CIAR serves a marketing site with a dozen client-side routes (projects, platform details, ads, legal pages) that must feel instant — but also needs real Next.js paths for `/admin/panel/*` and 40+ API endpoints. A pure App Router file-per-page approach would multiply layouts and slow down admin/content iteration.

**Solution.** A custom `RouterProvider` parses `window.location.hash` into a typed `PageRoute` union and renders the matching lazy-loaded component inside a single `app/page.tsx` entry. Admin routes bypass the hash router entirely via pathname detection. History is tracked in a ref-based stack with `navigate` / `back` APIs, and `AnimatePresence` handles exit animations without remounting the layout shell.

```ts
// Typed routes — no stringly-typed magic
type PageRoute =
  | { page: "home" }
  | { page: "project"; slug: string }
  | { page: "platform"; slug: string }
  | { page: "ads" }
  // …
```

**Trade-off.** Hash URLs (`/#/projects`) are less SEO-friendly than file-based routes; acceptable here because project/platform detail pages are also reachable via direct API-driven content and the admin CMS controls metadata separately.

---

### 2. Unified ad approval across two persistence sources

**Problem.** Advertisers can submit ads while authenticated (stored in `AdSubmission` via Prisma) or while unauthenticated (queued in a `Setting` JSON blob as a fallback). Admins need one inbox, one approval action, and one publish path — without duplicate entries or lost product details.

**Solution.** `listPendingAdRequests()` fetches both sources in parallel, normalizes them into `PendingAdRequestItem`, and deduplicates by `title + companyName + createdAt`. `approvePendingRequest()` merges admin-edited `productDetails` with the original submission, writes a `SiteAdRecord` into `site_ads_v1` settings, and marks the DB row `approved` or removes the queue entry — atomically per source. `getActiveAds()` checks slot occupancy and falls back to curated default ads so empty placements never render as broken UI.

**Result.** Operators see a single pending queue. Engineers keep a resilient write path that works even when the DB write succeeds but the settings queue is the faster fallback for edge deployments.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build + standalone packaging |
| `npm run start` | Run standalone production server |
| `npm run lint` | ESLint across the project |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed Super Platform modules and defaults |

---

## License

Private — All rights reserved.
