"use client";

import posthog from "posthog-js";

/**
 * PostHog browser client. Call `initPostHog()` once from a top-level Client
 * Component (e.g. a <PostHogProvider> rendered inside app/layout.tsx).
 *
 * Server-side capture (from API routes) should use `posthog-node` instead —
 * we'll wire that up when we add the form submission endpoint.
 */
let initialized = false;

export function initPostHog(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return; // silently no-op until keys exist
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
}

export { posthog };
