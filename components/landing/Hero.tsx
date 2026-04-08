import { STATS, type HeroContent } from "@/lib/landing-content";

type HeroProps = {
  content: HeroContent;
};

export function Hero({ content }: HeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center sm:pt-24">
      <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-200">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        {content.eyebrow}
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
        <span className="bg-gradient-to-br from-white via-white to-violet-200 bg-clip-text text-transparent">
          {content.headline}
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300">
        {content.subhead}
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#cta"
          className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] transition hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)]"
        >
          {content.primaryCta}
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
  );
}
