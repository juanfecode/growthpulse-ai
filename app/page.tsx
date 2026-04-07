import { cookies } from "next/headers";
import {
  AB_VARIANT_COOKIE,
  isValidVariant,
} from "@/lib/ab-testing";
import {
  HERO_VARIANTS,
  FEATURES,
  TESTIMONIALS,
  STATS,
  PRICING,
} from "@/lib/landing-content";

export default async function Page() {
  const store = await cookies();
  const cookieValue = store.get(AB_VARIANT_COOKIE)?.value;
  const variant = isValidVariant(cookieValue) ? cookieValue : "A";
  const hero = HERO_VARIANTS[variant];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.15),_transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,_rgba(255,255,255,0.04)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:64px_64px]"
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400" />
          <span className="text-lg font-semibold tracking-tight">
            GrowthPulse <span className="text-violet-400">AI</span>
          </span>
        </div>
        <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#cta" className="hover:text-white">Get started</a>
        </nav>
        <a
          href="#cta"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/15"
        >
          {hero.primaryCta}
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-200">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          {hero.eyebrow}
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-br from-white via-white to-violet-200 bg-clip-text text-transparent">
            {hero.headline}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300">
          {hero.subhead}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#cta"
            className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] transition hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)]"
          >
            {hero.primaryCta}
            <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#features"
            className="rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            See how it works
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-semibold text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Five tools. <span className="text-violet-300">One honest answer.</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Most marketing dashboards make you feel busy. GrowthPulse makes you decide.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-violet-400/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-cyan-400/10 p-10 sm:p-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Customer story
              </p>
              <blockquote className="mt-4 text-2xl font-medium leading-snug text-white sm:text-3xl">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </blockquote>
              <div className="mt-6 text-sm text-slate-400">
                — {TESTIMONIALS[0].author}, {TESTIMONIALS[0].company}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 opacity-60 lg:flex-col lg:items-end">
              {["NORTHWIND", "ACMECORP", "PIVOT.IO"].map((logo) => (
                <div
                  key={logo}
                  className="text-sm font-bold tracking-widest text-slate-300"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pricing that pays for itself.
          </h2>
          <p className="mt-4 text-slate-400">
            Most customers find more wasted spend in week one than the annual cost.
          </p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 ${
                tier.featured
                  ? "border-violet-400/40 bg-gradient-to-b from-violet-500/15 to-transparent shadow-[0_0_60px_-20px_rgba(139,92,246,0.4)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight">{tier.price}</span>
                <span className="text-slate-400">{tier.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{tier.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span className="mt-0.5 text-violet-300">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                  tier.featured
                    ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950 hover:opacity-90"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-400/10 p-10 text-center backdrop-blur sm:p-16">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to know what&rsquo;s actually broken?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Drop your details. We&rsquo;ll send you a personalized demo and a sample diagnostic for your stack.
          </p>
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-sm text-slate-400">
            Lead capture form coming next — wired to <code className="text-violet-300">/api/leads</code>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-slate-500">
        © 2026 GrowthPulse AI · Built for the Azarian Growth Agency assessment
      </footer>
    </main>
  );
}
