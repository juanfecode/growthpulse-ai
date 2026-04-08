import { prisma } from "@/lib/prisma";
import type { AbVariant, Role } from "@/lib/generated/prisma/enums";

/**
 * Read-only metric queries for the internal /dashboard.
 *
 * Each function does ONE thing and is independently testable. The dashboard
 * page composes them with Promise.all so total latency = max(query), not sum.
 */

export async function getTotalLeads(): Promise<number> {
  return prisma.lead.count();
}

export async function getTotalAssignments(): Promise<number> {
  return prisma.abAssignment.count();
}

export type VariantStats = {
  visitors: number;
  conversions: number;
  rate: number; // 0..1
};

export type ConversionByVariant = {
  A: VariantStats;
  B: VariantStats;
  /**
   * Winning variant if the absolute spread in conversion rate exceeds 5
   * percentage points. Below that we say "too close to call" — protects
   * against premature winners on small samples.
   */
  winner: AbVariant | null;
  spreadPp: number; // signed: positive means A wins, negative means B wins
};

const WINNER_THRESHOLD_PP = 5;

export async function getConversionByVariant(): Promise<ConversionByVariant> {
  // One query, four buckets: { variant: A|B, converted: true|false, _count }
  const rows = await prisma.abAssignment.groupBy({
    by: ["variant", "converted"],
    _count: { _all: true },
  });

  const acc: Record<AbVariant, VariantStats> = {
    A: { visitors: 0, conversions: 0, rate: 0 },
    B: { visitors: 0, conversions: 0, rate: 0 },
  };

  for (const row of rows) {
    const stats = acc[row.variant];
    stats.visitors += row._count._all;
    if (row.converted) stats.conversions += row._count._all;
  }
  acc.A.rate = acc.A.visitors > 0 ? acc.A.conversions / acc.A.visitors : 0;
  acc.B.rate = acc.B.visitors > 0 ? acc.B.conversions / acc.B.visitors : 0;

  const spreadPp = (acc.A.rate - acc.B.rate) * 100;
  let winner: AbVariant | null = null;
  if (Math.abs(spreadPp) > WINNER_THRESHOLD_PP) {
    winner = spreadPp > 0 ? "A" : "B";
  }

  return { A: acc.A, B: acc.B, winner, spreadPp };
}

export type RoleCount = { role: Role; count: number };

export async function getLeadsByRole(): Promise<RoleCount[]> {
  const rows = await prisma.lead.groupBy({
    by: ["role"],
    _count: { _all: true },
    orderBy: { _count: { role: "desc" } },
  });
  return rows.map((r) => ({ role: r.role, count: r._count._all }));
}

export type UtmSourceCount = { source: string; count: number };

export async function getLeadsByUtmSource(): Promise<UtmSourceCount[]> {
  const rows = await prisma.lead.groupBy({
    by: ["utmSource"],
    _count: { _all: true },
    orderBy: { _count: { utmSource: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({
    source: r.utmSource ?? "(direct)",
    count: r._count._all,
  }));
}

export type RecentLead = {
  id: string;
  name: string;
  email: string;
  role: Role;
  abVariant: AbVariant;
  utmSource: string | null;
  createdAt: Date;
};

export async function getRecentLeads(): Promise<RecentLead[]> {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      abVariant: true,
      utmSource: true,
      createdAt: true,
    },
  });
}
