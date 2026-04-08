import { z } from "zod";
import { Role } from "@/lib/generated/prisma/enums";

/**
 * Single source of truth for lead form payloads.
 *
 * Imported by:
 *   - components/forms/LeadForm.tsx (client-side validation before submit)
 *   - app/api/leads/route.ts        (server-side validation, the real gate)
 *
 * Why both sides? Client validation = fast UX feedback. Server validation =
 * the only one we trust, because anyone can curl the endpoint directly.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email"),
  role: z.nativeEnum(Role, {
    error: () => "Pick the option that best describes you",
  }),
  // Honeypot: a hidden field real users never fill. Bots fill every input
  // they find. We accept ANY string here so the schema validates; the route
  // handler then checks for non-empty and silently returns a fake 200 so the
  // bot thinks it worked and doesn't retry. (If we used `.max(0)` here, zod
  // would reject the request with 400 and the bot would retry — defeating
  // the purpose.)
  website: z.string().optional(),

  // UTMs piggyback on the form submission. The LeadForm reads them from
  // window.location.search at mount time and stuffs them into hidden inputs.
  utmSource: z.string().trim().max(120).nullish(),
  utmMedium: z.string().trim().max(120).nullish(),
  utmCampaign: z.string().trim().max(120).nullish(),
  utmTerm: z.string().trim().max(120).nullish(),
  utmContent: z.string().trim().max(120).nullish(),
});

export type LeadInput = z.infer<typeof leadSchema>;
