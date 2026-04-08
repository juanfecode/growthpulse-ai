import { test, expect } from "@playwright/test";

/**
 * Dashboard auth gate. We don't assert on metric numbers (they depend on
 * real DB state) — we just verify the gate works and the metrics shell
 * renders when authenticated.
 */

test("dashboard: no password → password prompt is shown", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Dashboard access" }),
  ).toBeVisible();
  // The metrics title should NOT be visible without auth
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toHaveCount(0);
});

test("dashboard: wrong password → still locked, error shown", async ({
  page,
}) => {
  await page.goto("/dashboard?password=definitely-wrong");
  await expect(
    page.getByRole("heading", { name: "Dashboard access" }),
  ).toBeVisible();
  await expect(page.getByText(/wrong password/i)).toBeVisible();
});

test("dashboard: correct password → metrics shell renders", async ({
  page,
}) => {
  const password = process.env.DASHBOARD_PASSWORD;
  test.skip(!password, "DASHBOARD_PASSWORD not set in environment");

  await page.goto(`/dashboard?password=${encodeURIComponent(password!)}`);

  // Authenticated header
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  // KPI labels are stable regardless of DB content
  await expect(page.getByText("Total leads")).toBeVisible();
  await expect(page.getByText("A/B visitors")).toBeVisible();
  await expect(page.getByText("Global conversion")).toBeVisible();
  await expect(page.getByText("Conversion by variant")).toBeVisible();
});
