import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import {
  AB_ASSIGNMENT_COOKIE,
  AB_VARIANT_COOKIE,
  isValidVariant,
  markConverted,
} from "@/lib/ab-testing";
import { posthogServer } from "@/lib/posthog-server";

// Prisma needs Node runtime, not Edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { _form: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    // Flatten zod errors into { fieldName: "message" } so the form can
    // attach them next to each input without extra parsing.
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot tripped: silently succeed so the bot doesn't retry.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true, role: data.role });
  }

  // Pull the A/B assignment from the cookies the middleware set on first visit.
  const store = await cookies();
  const assignmentId = store.get(AB_ASSIGNMENT_COOKIE)?.value;
  const variantCookie = store.get(AB_VARIANT_COOKIE)?.value;
  const variant = isValidVariant(variantCookie) ? variantCookie : "A";

  try {
    await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        abVariant: variant,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        utmTerm: data.utmTerm ?? null,
        utmContent: data.utmContent ?? null,
      },
    });

    // Best-effort: mark the A/B row as converted. If the cookie is missing
    // (e.g. user blocked cookies) we just skip — the lead is still saved.
    if (assignmentId) {
      try {
        await markConverted(assignmentId);
      } catch {
        // Stale or unknown id — don't fail the whole submission for this.
      }
    }

    // Server-side PostHog capture. distinctId = email so the person profile
    // in PostHog gets created/linked at this exact moment (this is the
    // "identify" step under person_profiles: "identified_only").
    if (posthogServer) {
      posthogServer.capture({
        distinctId: data.email,
        event: "lead_submitted",
        properties: {
          role: data.role,
          ab_variant: variant,
          utm_source: data.utmSource ?? null,
          utm_medium: data.utmMedium ?? null,
          utm_campaign: data.utmCampaign ?? null,
        },
      });
      // In serverless we must explicitly flush before the function exits.
      await posthogServer.shutdown();
    }

    return NextResponse.json({ ok: true, role: data.role });
  } catch (err) {
    console.error("[/api/leads] insert failed", err);
    return NextResponse.json(
      { ok: false, errors: { _form: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
