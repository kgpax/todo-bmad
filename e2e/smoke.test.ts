import { test, expect } from "@playwright/test";

test("homepage returns HTTP 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

test("homepage displays empty state when no todos exist", async ({ page }) => {
  await page.goto("/");
  const emptyState = page.locator('[role="status"]');
  await expect(emptyState).toBeVisible();
  await expect(emptyState).not.toBeEmpty();
});
