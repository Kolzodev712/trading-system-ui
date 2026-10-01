import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";

function banner(page: import("@playwright/test").Page) {
  return page.getByRole("banner").getByTestId("venue-mode-banner");
}

test("auth denial shows sign-in without a session", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("sign-in-form")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /operator sign in/i })).toBeVisible();
  await expect(page.getByTestId("connect-runner")).toHaveCount(0);
});

test("Paper venue banner, pause control, and stream stale/reconnect", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("trading.auth.token", "workflow");
    localStorage.setItem(
      "trading.auth.user",
      JSON.stringify({ username: "workflow", role: "operator" }),
    );
  });
  await page.goto("/");
  await page.getByTestId("connect-runner").click();
  await expect(banner(page)).toContainText(/PAPER/i, { timeout: 20_000 });
  await expect(banner(page)).toContainText(/LOCAL/i);
  await expect(banner(page)).not.toContainText(/STATUS STALE/i);

  await page.getByTestId("operator-PauseEntries").click();
  await expect(page.getByText(/PAPER/i).first()).toBeVisible();
  await page.getByTestId("operator-confirm").click();
  await expect(page.getByTestId("operator-entries-paused")).toHaveText(/yes/i, {
    timeout: 15_000,
  });

  const envoy = process.env.WORKFLOW_ENVOY_NAME;
  expect(envoy, "WORKFLOW_ENVOY_NAME").toBeTruthy();
  try {
    execFileSync("docker", ["pause", envoy!]);
    await expect(banner(page)).toContainText(/STATUS STALE/i, { timeout: 20_000 });
  } finally {
    execFileSync("docker", ["unpause", envoy!]);
  }
  await expect(banner(page)).toContainText(/PAPER/i, { timeout: 25_000 });
  await expect(banner(page)).not.toContainText(/STATUS STALE/i);
});
