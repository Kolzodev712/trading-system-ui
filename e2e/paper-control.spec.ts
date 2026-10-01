import { test, expect } from "@playwright/test";

test("Paper venue banner after connect through Envoy", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("trading.auth.token", "workflow");
    localStorage.setItem(
      "trading.auth.user",
      JSON.stringify({ username: "workflow", role: "operator" }),
    );
  });
  await page.goto("/");
  await page.getByTestId("connect-runner").click();
  const banner = page.getByRole("banner").getByTestId("venue-mode-banner");
  await expect(banner).toContainText(/PAPER/i, { timeout: 20_000 });
  await expect(banner).toContainText(/LOCAL/i);
});
