import { PostHog } from "posthog-node";

/**
 * Server-side PostHog client for events fired from API routes.
 *
 * Why a separate file from lib/posthog.ts?
 *   - lib/posthog.ts is "use client" (posthog-js, browser-only).
 *   - This one is server-only (posthog-node, Node runtime).
 * Same PostHog project, two SDKs, two distinct clients.
 *
 * Singleton pattern (same as lib/prisma.ts) so serverless invocations
 * reuse the client between warm requests instead of opening a new one
 * every time.
 */
const globalForPosthog = globalThis as unknown as {
  posthogServer: PostHog | undefined;
};

function createPosthogServer(): PostHog | null {
  // Reuses the same PostHog project key as the browser client. The
  // NEXT_PUBLIC_ prefix only controls *exposure* to the bundle — server
  // code can read it too.
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return null; // no-op locally until the key is set in Vercel
  return new PostHog(key, {
    host,
    // Flush every event immediately. In a serverless function the process
    // can die right after the response, so we cannot rely on batching.
    flushAt: 1,
    flushInterval: 0,
  });
}

export const posthogServer: PostHog | null =
  globalForPosthog.posthogServer ?? createPosthogServer();

if (process.env.NODE_ENV !== "production" && posthogServer) {
  globalForPosthog.posthogServer = posthogServer;
}
