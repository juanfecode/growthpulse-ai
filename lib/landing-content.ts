import type { AbVariant } from "@/lib/generated/prisma/enums";

export type HeroContent = {
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: string;
};

export const HERO_VARIANTS: Record<AbVariant, HeroContent> = {
  A: {
    eyebrow: "Data-driven growth diagnostics",
    headline: "Your marketing stack has a leak. Find it in minutes.",
    subhead:
      "GrowthPulse connects to HubSpot, GA4, Meta Ads, Klaviyo, and 30+ tools and scores your performance across 7 growth dimensions — so you know exactly where you're losing money before you spend another dollar.",
    primaryCta: "Run my diagnostic",
  },
  B: {
    eyebrow: "The honest friend who reads your dashboards",
    headline: "Stop guessing. Start growing.",
    subhead:
      "We found $140K in wasted ad spend for one customer in week one. Plug GrowthPulse into your stack and finally know what's actually working — no fractional CMO required.",
    primaryCta: "Find my $140K leak",
  },
};

// Icons are imported by name in FeaturesSection.tsx (lucide-react). Using
// string identifiers here keeps this file framework-free and serializable.
export const FEATURES = [
  {
    title: "One-Click Stack Integration",
    desc: "Connects to HubSpot, Google Analytics, Meta Ads, Klaviyo, Salesforce, and 30+ tools via API in under 5 minutes.",
    icon: "Plug",
  },
  {
    title: "7-Dimension Growth Score",
    desc: "Proprietary algorithm rates acquisition, activation, retention, revenue, referral, SEO health, and paid efficiency on a 0–100 scale — benchmarked against industry peers.",
    icon: "Gauge",
  },
  {
    title: "AI-Generated Action Plan",
    desc: "A prioritized 90-day roadmap with specific recommendations ranked by expected impact and effort. No more guessing what to fix first.",
    icon: "Compass",
  },
  {
    title: "Executive Summary Report",
    desc: "Auto-generates a board-ready PDF with key findings, visualized scores, and strategic recommendations your CEO will actually read.",
    icon: "FileText",
  },
  {
    title: "Live Dashboard",
    desc: "Real-time monitoring of all 7 dimensions with alerts when performance dips below benchmarks. Catch problems before they become quarters.",
    icon: "LineChart",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "GrowthPulse found $140K in wasted ad spend we didn't know about. It paid for itself in the first week.",
    author: "VP Marketing",
    company: "Series B SaaS (fictional)",
  },
];

export const STATS = [
  { value: "500+", label: "companies audited" },
  { value: "32%", label: "avg. ROI lift in 90 days" },
  { value: "4.8/5", label: "customer rating" },
];

export const PRICING = [
  {
    name: "Starter",
    price: "$499",
    cadence: "/mo",
    description: "For small teams running their first audit.",
    features: [
      "Up to 5 integrations",
      "Monthly diagnostic",
      "Quarterly action plans",
      "2 seats",
      "Email support",
    ],
    cta: "Start with Starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "$1,299",
    cadence: "/mo",
    description: "Most teams pick this. Built for compounding fixes.",
    features: [
      "Up to 15 integrations",
      "Weekly diagnostic",
      "Monthly action plans",
      "5 seats",
      "Priority email + chat",
    ],
    cta: "Pick Growth",
    featured: true,
  },
  {
    name: "Scale",
    price: "$2,999",
    cadence: "/mo",
    description: "For teams treating growth like an operating system.",
    features: [
      "Unlimited integrations",
      "Daily diagnostic + alerts",
      "Monthly + live dashboard",
      "Unlimited seats",
      "Dedicated success manager",
    ],
    cta: "Talk to Sales",
    featured: false,
  },
] as const;
