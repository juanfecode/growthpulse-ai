import { Plug, Gauge, Compass, FileText, LineChart, type LucideIcon } from "lucide-react";
import { FEATURES } from "@/lib/landing-content";

const ICONS: Record<string, LucideIcon> = {
  Plug,
  Gauge,
  Compass,
  FileText,
  LineChart,
};

export function FeaturesSection() {
  // Split 5 features into 3 + 2 so the second row centers cleanly instead
  // of leaving an empty slot in a 3-col grid.
  const firstRow = FEATURES.slice(0, 3);
  const secondRow = FEATURES.slice(3);

  return (
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
        {firstRow.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-[calc(66.666%+1.5rem)] lg:grid-cols-2">
        {secondRow.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const Icon = ICONS[feature.icon] ?? Plug;
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-violet-400/30 hover:bg-white/[0.05]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-violet-200 ring-1 ring-inset ring-white/10">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
    </div>
  );
}
