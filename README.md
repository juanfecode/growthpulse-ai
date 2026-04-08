# GrowthPulse AI

> The honest friend who reads your dashboards.

A marketing landing + lead capture system for **GrowthPulse AI**, a (fictional) SaaS that connects your marketing stack and delivers a 7-dimension growth diagnostic. Built as a technical assessment for Azarian Growth Agency.

**Live demo:** https://growthpulse-ai-seven.vercel.app
**Repo:** https://github.com/juanfecode/growthpulse-ai

### For reviewers — internal dashboard

After submitting the form on the landing page, the lead and its A/B conversion show up in the internal dashboard:

**👉 https://growthpulse-ai-seven.vercel.app/dashboard?password=azarianJuanFe**

You'll see total leads, conversion rate by variant (with a "winner" badge once one variant is more than 5 percentage points ahead), breakdowns by role and UTM source, and the latest 20 submissions in real time. The password gate is intentionally simple — query-param auth is documented as a trade-off below.

---

## What's built

| Capability | Where it lives |
|---|---|
| Landing page (5 sections, A/B variants) | `app/page.tsx` + `components/landing/*` + `lib/landing-content.ts` |
| Lead capture form | `components/forms/LeadForm.tsx` |
| Lead API (validation + insert + conversion tracking) | `app/api/leads/route.ts` |
| Personalized thank-you page | `app/thank-you/page.tsx` |
| A/B testing (deterministic 50/50) | `lib/ab-testing.ts` + `middleware.ts` |
| UTM parsing | `lib/utm.ts` |
| PostHog tracking (browser + server) | `lib/posthog.ts` + `lib/posthog-server.ts` + `components/providers/PostHogProvider.tsx` |
| RLS hardening | `prisma/sql/enable_rls.sql` |
| Health check | `app/api/health/route.ts` |
| Internal metrics dashboard | `app/dashboard/page.tsx` + `lib/dashboard-metrics.ts` |

**Still pending:** Playwright E2E tests, this README's "screenshots" section. See [Roadmap](#roadmap).

---

## Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components for fast SSR, file-based routing, native middleware with Node runtime support |
| Language | **TypeScript** strict | Catches schema/UI drift at compile-time, especially across the DB ↔ form boundary |
| Styling | **Tailwind CSS v4** | Iteration speed, implicit design system, no extra CSS files |
| ORM | **Prisma v7** + `@prisma/adapter-pg` | Auto-generated types from `schema.prisma`, first-class connection pooling |
| Database | **Supabase Postgres** | Managed Postgres + dashboard + RLS + PgBouncer pooler |
| Validation | **zod** v4 | One schema (`lib/validation.ts`) shared by client and server — single source of truth |
| Analytics | **PostHog** (`person_profiles: identified_only`) | Product analytics + funnel tracking + cost-controlled (anonymous visitors share a bucket) |
| Hosting | **Vercel** | 1-click deploy from GitHub, env vars per environment, supports `runtime: "nodejs"` middleware |

---

## Architecture — the four decisions worth explaining

### 1. A/B testing is deterministic, not random

`Math.random() < 0.5` is fine for millions of impressions but **biases hard at low traffic**. With 20 visitors you can easily end up 14/6.

Instead, on every first visit the middleware queries `SELECT COUNT(*) FROM ab_assignments`. Even count → variant A. Odd count → variant B. Then it inserts a new row. Result: an exact `A,B,A,B,…` sequence — 50/50 guaranteed regardless of traffic.

```ts
// lib/ab-testing.ts
export async function assignNextAssignment(): Promise<Assignment> {
  const count = await prisma.abAssignment.count();
  const variant: AbVariant = count % 2 === 0 ? "A" : "B";
  return prisma.abAssignment.create({
    data: { variant },
    select: { id: true, variant: true },
  });
}
```

### 2. The cookie stores the row id, not just the variant

The naive approach is to store `gp_variant=A` in a cookie and, on conversion, run `UPDATE ab_assignments SET converted=true WHERE variant='A' AND converted=false`. **That marks every visitor in variant A as converted** — bug that destroys your conversion rate.

We store **two** cookies: `gp_variant` (for the UI) and `gp_assignment` (the row UUID). Conversion is `UPDATE … WHERE id=…`, so each visitor flips their own row exactly once.

### 3. Middleware runs on Node, not Edge

Prisma can't run on Vercel's Edge runtime. The two options are (a) the Prisma Data Proxy (slow, paid) or (b) forcing the middleware to Node with `export const config = { runtime: "nodejs" }`. We chose (b) — supported in Next 15+, minimal latency overhead, free.

### 4. RLS even though we use Prisma

Prisma connects as `postgres` super-user, so it bypasses RLS — every Prisma query works. **But Supabase also exposes a public REST API at `/rest/v1/leads` using the `anon` key that ships in the browser bundle.** Without RLS, anyone could `fetch()` that endpoint from DevTools and exfiltrate every lead.

We enabled RLS on `leads` and `ab_assignments` with **zero policies for `anon`**, fully blocking the REST surface. Prisma server-side keeps working because it connects as super-user. Defense in depth.

```sql
-- prisma/sql/enable_rls.sql (excerpt)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
-- no policies for anon — REST API is fully blocked
```

---

## Data flow: a lead from click to dashboard

```
User lands on / with ?utm_source=linkedin
        │
        ▼
middleware.ts (Node runtime)
  • reads gp_variant + gp_assignment cookies
  • if missing: assignNextAssignment() → INSERT ab_assignments → set both cookies
        │
        ▼
app/page.tsx (Server Component)
  • reads gp_variant cookie → picks HERO_VARIANTS[A|B]
  • renders <Header/> <Hero/> <FeaturesSection/> <CustomerStory/>
            <PricingSection/> <FinalCta> with <LeadForm/> </FinalCta> <Footer/>
        │
        ▼ (user fills form)
components/forms/LeadForm.tsx ("use client")
  • parseUtmParams(window.location.search)
  • posthog.capture("form_started") on first keystroke
  • POST /api/leads { name, email, role, website (honeypot), utm* }
        │
        ▼
app/api/leads/route.ts (Node runtime)
  • leadSchema.safeParse(body)         ← zod validation
  • if honeypot.website filled → fake 200, no insert
  • prisma.lead.create({ ... abVariant from cookie })
  • markConverted(assignmentId)        ← flips ab_assignments.converted
  • posthogServer.capture("lead_submitted", { distinctId: email })
  • return { ok: true, role }
        │
        ▼
LeadForm
  • posthog.identify(email, { role })  ← links anonymous → person profile
  • router.push(`/thank-you?role=${role}`)
        │
        ▼
app/thank-you/page.tsx (Server Component)
  • reads ?role= from searchParams (Promise in Next 16)
  • renders role-specific copy
```

---

## PostHog: two SDKs, one project

PostHog has two halves and we use both:

| SDK | File | Runs in | Fires |
|---|---|---|---|
| `posthog-js` | `lib/posthog.ts` + `components/providers/PostHogProvider.tsx` | Browser | `form_started`, `form_error`, `lead_submitted_client`, `identify(email)` |
| `posthog-node` | `lib/posthog-server.ts` | Node runtime (API route) | `lead_submitted` |

The browser SDK runs `identify(email)` to link the anonymous visitor to a person profile (cheap, because we use `person_profiles: "identified_only"` to keep the bill sane). The server SDK fires `lead_submitted` from inside `/api/leads` after the DB insert succeeds — that's the source of truth, because the browser event can be lost if the user closes the tab between submit and redirect.

Both clients read the same project key from `NEXT_PUBLIC_POSTHOG_KEY` (the `NEXT_PUBLIC_` prefix only controls bundle exposure — server code can read it too).

---

## Schema

```prisma
model Lead {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  email       String
  role        Role
  abVariant   AbVariant @map("ab_variant")
  utmSource   String?   @map("utm_source")
  utmMedium   String?   @map("utm_medium")
  utmCampaign String?   @map("utm_campaign")
  utmTerm     String?   @map("utm_term")
  utmContent  String?   @map("utm_content")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  @@map("leads")
}

model AbAssignment {
  id        String    @id @default(uuid()) @db.Uuid
  variant   AbVariant
  converted Boolean   @default(false)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  @@map("ab_assignments")
}

enum Role     { Founder VPMarketing CMO Otro }
enum AbVariant { A B }
```

---

## Setup

```bash
git clone git@github.com:juanfecode/growthpulse-ai.git
cd growthpulse-ai
npm install                    # runs prisma generate via postinstall

# create .env with the 6 vars below
cp .env.example .env           # fill in real values

npx prisma migrate deploy      # apply the migration to your Supabase DB

# one-time: enable RLS in Supabase SQL Editor
# paste the contents of prisma/sql/enable_rls.sql

npm run dev                    # http://localhost:3000
curl localhost:3000/api/health # → {"ok":true,"db":"connected",...}
```

### Required environment variables

```bash
# Supabase Postgres — pooler (port 6543) for runtime, direct (5432) for migrations
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres

# PostHog — same project key, different exposure
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Dashboard auth (used in Bloque 5)
DASHBOARD_PASSWORD=...
```

---

## Project structure

```
app/
  api/
    health/route.ts        ← DB connectivity probe
    leads/route.ts         ← POST handler: validate → insert → mark converted → PostHog
  thank-you/page.tsx       ← role-personalized confirmation
  layout.tsx               ← metadata, fonts, mounts <PostHogProvider>
  page.tsx                 ← Server Component, reads variant cookie, composes landing

components/
  landing/                 ← presentational sections (Header, Hero, FeaturesSection, ...)
  forms/LeadForm.tsx       ← Client Component
  providers/PostHogProvider.tsx

lib/
  ab-testing.ts            ← assignNextAssignment, markConverted, type guards
  utm.ts                   ← parseUtmParams (shared by form and API)
  validation.ts            ← zod schema (shared client/server)
  prisma.ts                ← Prisma singleton + adapter-pg
  posthog.ts               ← browser SDK init
  posthog-server.ts        ← Node SDK singleton
  landing-content.ts       ← copy for both A/B variants

middleware.ts              ← Node runtime, matcher /, sets gp_variant + gp_assignment cookies

prisma/
  schema.prisma
  migrations/...
  sql/enable_rls.sql       ← versioned, idempotent

.claude-notes/             ← gitignored: brief, README draft, state for future sessions
```

---

## AI tools used

This project was built with **Claude Code** (Sonnet 4.6 + Opus 4.6) as the primary pair-programming assistant. Concretely:

- **Architecture discussions** before each block (options, trade-offs, decision, then code) — "discuss before coding" was the explicit collaboration rule.
- **Boilerplate generation** for Prisma config, middleware, Tailwind UI, and the zod schema.
- **Debugging** of Prisma v7 quirks (the adapter is mandatory, the datasource doesn't take a `url`, `prisma.config.ts` must point to `DIRECT_URL`), Vercel build (postinstall + build both run `prisma generate`), and Next 16 changes (`searchParams` is a `Promise`).
- **Persistent memory** between sessions via Claude Code's file-based memory at `~/.claude/projects/.../memory/` — kept the brief, collaboration rules, and project state across days so the assistant didn't "forget" the project on restart.

The collaboration model was strictly: Claude proposes options + trade-offs, Juan Felipe decides, Claude executes. Every commit is reviewed and signed off manually (no auto-merging from the AI).

---

## Trade-offs

| Decision | What we did | Why |
|---|---|---|
| Form rate limiting | Skipped | Demo, not production. In prod: Vercel KV or Upstash Redis with `@upstash/ratelimit`. |
| Anti-bot | Honeypot field `website` only | Captcha would hurt conversion and isn't justified at this scale. |
| Dashboard auth | `?password=` query param (planned) | Faster than NextAuth for a single evaluator. In prod: HTTP-only session cookie + proper auth. |
| `updateMany` on conversion | Replaced with `update WHERE id=...` via second cookie | Naive approach would mark every variant-A visitor as converted — fixed proactively. |
| Component extraction | `components/landing/*` feature-grouped | Aligns with the convention used in our other Next.js projects, easier to navigate. |
| PostHog session replay | Off | Privacy + cost. Events only. |
| A/B variants | Headline + eyebrow + CTA only | Enough to demonstrate the pattern; more variants = more noise. |
| i18n | English only | Brief doesn't require it. |
| Server-side `lead_submitted` | Flushed on every request (`flushAt: 1`) | Serverless functions die after the response; can't rely on batching. |
| Supabase pooler TLS validation | Disabled in `lib/prisma.ts` (`sslmode=require` → `sslmode=no-verify`) | The connection is still TLS-encrypted; we skip CA validation because bundling Supabase's `prod-ca-2021.crt` into a serverless function is more friction than it's worth for this scope. Production would ship the CA cert and verify against it. |

---

## Roadmap

| Block | Branch | Status |
|---|---|---|
| RLS policies | `feat/rls-policies` | ✅ merged (#1) |
| A/B testing | `feat/ab-testing` | ✅ merged (#2) |
| Landing page | `feat/landing` | ✅ merged (#3) |
| Lead form + API + thank-you | `feat/lead-form` | 🟡 PR open (#4) |
| Dashboard with metrics | `feat/dashboard` | ⏳ next |
| Playwright E2E tests | `feat/playwright-tests` | ⏳ |
| README polish + screenshots | `chore/readme-final` | ⏳ |

---

## Commit history

This repo follows a strict **branch-per-feature → PR → merge** workflow. The commit log shows the build broken into logical, reviewable units instead of a single squashed commit. See [closed PRs](https://github.com/juanfecode/growthpulse-ai/pulls?q=is%3Apr+is%3Aclosed).
