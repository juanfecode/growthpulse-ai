import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [leads, assignments] = await Promise.all([
      prisma.lead.count(),
      prisma.abAssignment.count(),
    ]);
    return NextResponse.json({
      ok: true,
      db: "connected",
      leads,
      assignments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        message: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
