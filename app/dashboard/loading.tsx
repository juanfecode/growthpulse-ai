export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/5" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
          />
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>

      <div className="mt-10 h-96 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
    </main>
  );
}
