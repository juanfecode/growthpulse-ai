import { LeadForm } from "@/components/forms/LeadForm";

export function FinalCta() {
  return (
    <section id="cta" className="mx-auto max-w-4xl px-6 py-24">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-400/10 p-10 text-center backdrop-blur sm:p-16">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Ready to know what’s actually broken?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Drop your details. We’ll send you a personalized demo and a sample diagnostic for your stack.
        </p>
        <LeadForm />
      </div>
    </section>
  );
}
