import {
  getTotalLeads,
  getTotalAssignments,
  getConversionByVariant,
  getLeadsByRole,
  getLeadsByUtmSource,
  getRecentLeads,
  type VariantStats,
} from "@/lib/dashboard-metrics";

// Always read fresh data — never cache the dashboard.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ROLE_LABELS: Record<string, string> = {
  Founder: "Founder / CEO",
  VPMarketing: "VP of Marketing",
  CMO: "CMO",
  Otro: "Other",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const { password } = await searchParams;
  const expected = process.env.DASHBOARD_PASSWORD;

  if (!expected) {
    return (
      <Shell>
        <ErrorBox>
          <code className="text-violet-300">DASHBOARD_PASSWORD</code> is not set
          on the server. Configure it in your environment variables to enable
          the dashboard.
        </ErrorBox>
      </Shell>
    );
  }

  if (password !== expected) {
    return (
      <Shell>
        <PasswordPrompt wrongAttempt={password !== undefined} />
      </Shell>
    );
  }

  const [
    totalLeads,
    totalAssignments,
    conversion,
    byRole,
    byUtm,
    recent,
  ] = await Promise.all([
    getTotalLeads(),
    getTotalAssignments(),
    getConversionByVariant(),
    getLeadsByRole(),
    getLeadsByUtmSource(),
    getRecentLeads(),
  ]);

  const globalRate =
    totalAssignments > 0 ? (totalLeads / totalAssignments) * 100 : 0;

  return (
    <Shell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Internal metrics — read-only. Refresh the page to pull fresh data.
          </p>
        </div>
        <a
          href="/"
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Back to landing
        </a>
      </div>

      {/* Top KPI cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total leads" value={totalLeads.toString()} />
        <KpiCard label="A/B visitors" value={totalAssignments.toString()} />
        <KpiCard
          label="Global conversion"
          value={`${globalRate.toFixed(1)}%`}
          hint={`${totalLeads} of ${totalAssignments}`}
        />
        <KpiCard
          label="Spread (A − B)"
          value={`${conversion.spreadPp >= 0 ? "+" : ""}${conversion.spreadPp.toFixed(1)} pp`}
          hint={
            conversion.winner
              ? `${conversion.winner} is winning`
              : "Too close to call (<5 pp)"
          }
        />
      </div>

      {/* A vs B */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Conversion by variant
        </h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <VariantCard
            label="Variant A"
            stats={conversion.A}
            isWinner={conversion.winner === "A"}
          />
          <VariantCard
            label="Variant B"
            stats={conversion.B}
            isWinner={conversion.winner === "B"}
          />
        </div>
      </section>

      {/* Breakdown tables */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <BreakdownCard title="Leads by role">
          {byRole.length === 0 ? (
            <EmptyRow>No leads yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-white/5">
              {byRole.map((r) => (
                <li
                  key={r.role}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-slate-300">
                    {ROLE_LABELS[r.role] ?? r.role}
                  </span>
                  <span className="font-mono text-white">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </BreakdownCard>

        <BreakdownCard title="Top UTM sources">
          {byUtm.length === 0 ? (
            <EmptyRow>No leads yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-white/5">
              {byUtm.map((u) => (
                <li
                  key={u.source}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-slate-300">{u.source}</span>
                  <span className="font-mono text-white">{u.count}</span>
                </li>
              ))}
            </ul>
          )}
        </BreakdownCard>
      </section>

      {/* Recent leads */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent leads (latest 20)
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          {recent.length === 0 ? (
            <EmptyRow>No leads yet — submit the form on the landing page.</EmptyRow>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">UTM source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {formatRelative(l.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-white">{l.name}</td>
                    <td className="px-4 py-3 text-slate-300">{l.email}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {ROLE_LABELS[l.role] ?? l.role}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          l.abVariant === "A"
                            ? "bg-violet-500/20 text-violet-200"
                            : "bg-cyan-400/20 text-cyan-200"
                        }`}
                      >
                        {l.abVariant}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {l.utmSource ?? "(direct)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>;
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function VariantCard({
  label,
  stats,
  isWinner,
}: {
  label: string;
  stats: VariantStats;
  isWinner: boolean;
}) {
  const ratePct = (stats.rate * 100).toFixed(1);
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        isWinner
          ? "border-violet-400/40 bg-gradient-to-br from-violet-500/15 to-cyan-400/10 shadow-[0_0_60px_-20px_rgba(139,92,246,0.4)]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {isWinner && (
        <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 text-xs font-semibold text-slate-950">
          Winner
        </span>
      )}
      <div className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-white">{ratePct}%</span>
        <span className="text-sm text-slate-400">conversion</span>
      </div>
      <div className="mt-4 flex justify-between text-xs text-slate-400">
        <span>{stats.conversions} conversions</span>
        <span>{stats.visitors} visitors</span>
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
      {children}
    </div>
  );
}

function PasswordPrompt({ wrongAttempt }: { wrongAttempt: boolean }) {
  return (
    <div className="mx-auto mt-20 max-w-md">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Dashboard access
      </h1>
      <p className="mt-2 text-center text-sm text-slate-400">
        Enter the password shared with reviewers.
      </p>
      <form
        method="GET"
        action="/dashboard"
        className="mt-8 flex flex-col gap-3"
      >
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Unlock
        </button>
        {wrongAttempt && (
          <p className="text-center text-xs text-rose-300">
            Wrong password. Try again.
          </p>
        )}
      </form>
    </div>
  );
}

// Lightweight relative time formatter — no date-fns dep for one helper.
function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}
