import Link from "next/link";
import { Role } from "@/lib/generated/prisma/enums";

const ROLE_MESSAGES: Record<Role, { headline: string; body: string }> = {
  [Role.Founder]: {
    headline: "Welcome, founder.",
    body: "We’ll send you a sample diagnostic for an early-stage SaaS within 24 hours — the kind of report we’d show your board. No fluff, just where the leaks are.",
  },
  [Role.VPMarketing]: {
    headline: "You’re in good company.",
    body: "Most VPs of Marketing find their first $50K leak inside week one. We’ll send you a benchmark report against peers in your stage, plus a 1:1 walkthrough invite.",
  },
  [Role.CMO]: {
    headline: "Let’s talk strategy.",
    body: "We’ll loop you in with our CMO concierge to walk through how GrowthPulse plugs into your existing reporting cadence — board-ready outputs included.",
  },
  [Role.Otro]: {
    headline: "Thanks for reaching out.",
    body: "We’ll send you a personalized walkthrough based on your stack within 24 hours.",
  },
};

function isRole(value: string | undefined): value is Role {
  return (
    value === Role.Founder ||
    value === Role.VPMarketing ||
    value === Role.CMO ||
    value === Role.Otro
  );
}

export default async function ThankYouPage({
  searchParams,
}: {
  // Next 16: searchParams is now a Promise.
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const message = isRole(role) ? ROLE_MESSAGES[role] : ROLE_MESSAGES[Role.Otro];

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.25),_transparent_60%)]"
      />
      <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-200">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        Submission received
      </span>
      <h1 className="mx-auto mt-6 max-w-2xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        {message.headline}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-slate-300">
        {message.body}
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
      >
        ← Back to home
      </Link>
    </main>
  );
}
