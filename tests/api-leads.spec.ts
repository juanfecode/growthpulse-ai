import { test, expect } from "@playwright/test";

/**
 * Server-side contract for POST /api/leads.
 * Tests the route handler in isolation, without going through the UI.
 */

test("POST /api/leads: invalid email → 400 with errors.email", async ({
  request,
}) => {
  const res = await request.post("/api/leads", {
    data: {
      name: "Test",
      email: "not-an-email",
      role: "Founder",
    },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(body.errors?.email).toBeTruthy();
});

test("POST /api/leads: missing role → 400", async ({ request }) => {
  const res = await request.post("/api/leads", {
    data: {
      name: "Test",
      email: "ok@example.com",
    },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.ok).toBe(false);
});

test("POST /api/leads: honeypot filled → fake 200, no error", async ({
  request,
}) => {
  const res = await request.post("/api/leads", {
    data: {
      name: "Bot",
      email: `bot+${Date.now()}@example.com`,
      role: "Otro",
      website: "http://spam.example.com", // honeypot tripped
    },
  });
  // We return 200 silently so the bot doesn't retry. The lead is NOT inserted.
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test("POST /api/leads: valid payload → 200 + role echoed", async ({
  request,
}) => {
  const res = await request.post("/api/leads", {
    data: {
      name: "Valid User",
      email: `valid+${Date.now()}@example.com`,
      role: "VPMarketing",
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.role).toBe("VPMarketing");
});
