# GrowthPulse AI — Landing Page

A marketing landing + internal dashboard for **GrowthPulse AI**, a (fictional) tool that diagnoses where marketing budget gets wasted. Built as a technical assessment.

## Architecture Overview

_TODO: diagram of flow → form → API route → Supabase + PostHog_

## Stack & Why

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | _TODO_ |
| Styling | Tailwind CSS v4 | _TODO_ |
| Database | Supabase (Postgres + RLS) | _TODO_ |
| Analytics | PostHog | _TODO_ |
| E2E tests | Playwright | _TODO_ |
| Language | TypeScript (strict) | _TODO_ |
| Deploy | Vercel | _TODO_ |

## Key Decisions

### A/B Testing Algorithm (50/50 Deterministic)

_TODO: why we don't use `Math.random()` and how the Supabase counter works._

### Honeypot Anti-bot

_TODO: hidden `website` field, silently discard if filled._

### Next.js App Router

_TODO: Server Components by default, why App Router over Pages._

## AI Tools Used

_TODO: what Claude Code generated vs what Juan Felipe decided._

## Trade-offs

_TODO: what we sacrificed for time and what we'd do differently._

## Setup Instructions

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

## Environment Variables

See `.env.example`.

## Running Tests

```bash
npx playwright test
```
