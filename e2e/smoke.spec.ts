import { test, expect } from "@playwright/test";

test("home responds and declares pt-BR", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
