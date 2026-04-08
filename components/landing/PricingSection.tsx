import { PRICING } from "@/lib/landing-content";

export function PricingSection() {
  return (
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
  );
}
