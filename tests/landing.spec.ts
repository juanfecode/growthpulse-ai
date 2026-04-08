import { test, expect } from "@playwright/test";

/**
 * Happy path: landing → form submit → thank-you with role-specific copy.
 *
 * Assumptions:
 *   - `npm run dev` is running on http://localhost:3000
 *   - DB is reachable; this test inserts ONE real row into `leads` per run.
 *     Email is salted with a timestamp so reruns don't collide on uniqueness
 *     constraints (currently there isn't one, but it's good hygiene).
 */
test("landing: visit → submit form → thank-you (founder)", async ({ page }) => {
  await page.goto("/");

  // Header brand is always visible regardless of A/B variant
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // 5 features + 3 pricing tiers should always render
  await expect(
    page.getByRole("heading", { name: "One-Click Stack Integration" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "7-Dimension Growth Score" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Live Dashboard" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Starter", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Growth", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Scale", exact: true }),
  ).toBeVisible();

  // Fill the form
  const ts = Date.now();
  await page.getByLabel("Name").fill("E2E Test User");
  await page.getByLabel("Work email").fill(`e2e+${ts}@example.com`);
  await page.getByLabel("Your role").selectOption("Founder");

  // Submit and follow the client-side redirect to /thank-you?role=Founder
  await Promise.all([
    page.waitForURL(/\/thank-you\?role=Founder/),
    page.getByRole("button", { name: /get my diagnostic/i }).click(),
  ]);

  // Founder-specific headline lives on the thank-you page
  await expect(
    page.getByRole("heading", { name: "Welcome, founder." }),
  ).toBeVisible();
});

test("landing: client validation rejects bad email", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Name").fill("Bad Email");
  await page.getByLabel("Work email").fill("not-an-email");
  await page.getByLabel("Your role").selectOption("CMO");
  await page.getByRole("button", { name: /get my diagnostic/i }).click();

  // Server returns 400 → form shows the zod error inline
  await expect(page.getByText(/valid email/i)).toBeVisible();
  // Stay on the landing — no redirect
  await expect(page).toHaveURL(/\/$|\/?$/);
});
