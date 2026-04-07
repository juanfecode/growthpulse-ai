export type ABVariant = "A" | "B";

export type Role = "Founder" | "VP Marketing" | "CMO" | "Otro";

export type Lead = {
  id: string;
  name: string;
  email: string;
  role: Role;
  ab_variant: ABVariant;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string;
};
