"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { posthog } from "@/lib/posthog";
import { parseUtmParams, type UtmParams } from "@/lib/utm";
import { Role } from "@/lib/generated/prisma/enums";

type FieldErrors = Partial<Record<
  "name" | "email" | "role" | "_form",
  string
>>;

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: Role.Founder, label: "Founder / CEO" },
  { value: Role.VPMarketing, label: "VP of Marketing" },
  { value: Role.CMO, label: "CMO" },
  { value: Role.Otro, label: "Other" },
];

export function LeadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  // Read UTMs once on mount via the shared parser in lib/utm.ts. They live
  // in window.location.search because the user landed via a campaign URL
  // (?utm_source=...). We stash them in a ref so they ride along with the
  // form submission without causing re-renders.
  const utmsRef = useRef<UtmParams>({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
  });
  useEffect(() => {
    utmsRef.current = parseUtmParams(new URLSearchParams(window.location.search));
  }, []);

  function trackFirstKeystroke() {
    if (startedRef.current) return;
    startedRef.current = true;
    posthog.capture?.("form_started");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          website, // honeypot — should always be ""
          ...utmsRef.current,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrors(json.errors ?? { _form: "Something went wrong." });
        posthog.capture?.("form_error", { status: res.status });
        setSubmitting(false);
        return;
      }

      // Link the anonymous PostHog session to this person. This is the
      // "identify" call that creates the person profile under the
      // identified_only setting.
      posthog.identify?.(email, { role });
      posthog.capture?.("lead_submitted_client", { role });

      router.push(`/thank-you?role=${encodeURIComponent(role)}`);
    } catch {
      setErrors({ _form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={trackFirstKeystroke}
      className="mx-auto mt-10 grid max-w-xl gap-4 text-left"
      noValidate
    >
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          placeholder="Jane Cooper"
          disabled={submitting}
        />
        {errors.name && <p className="mt-1.5 text-xs text-rose-300">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          placeholder="jane@company.com"
          disabled={submitting}
        />
        {errors.email && <p className="mt-1.5 text-xs text-rose-300">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Your role
        </label>
        <select
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          disabled={submitting}
        >
          <option value="" disabled className="bg-slate-900">
            Pick one…
          </option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1.5 text-xs text-rose-300">{errors.role}</p>}
      </div>

      {/* Honeypot — visually hidden, off-screen, untabbable. Real users
          never see or fill this. Bots fill every input they encounter. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {errors._form && (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
          {errors._form}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] transition hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Get my diagnostic"}
      </button>
      <p className="text-center text-xs text-slate-500">
        No credit card. We&rsquo;ll never share your email.
      </p>
    </form>
  );
}
