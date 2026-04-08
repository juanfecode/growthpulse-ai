import { TESTIMONIALS } from "@/lib/landing-content";

export function CustomerStory() {
  const t = TESTIMONIALS[0];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-cyan-400/10 p-10 sm:p-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              Customer story
            </p>
            <blockquote className="mt-4 text-2xl font-medium leading-snug text-white sm:text-3xl">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="mt-6 text-sm text-slate-400">
              — {t.author}, {t.company}
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
  );
}
