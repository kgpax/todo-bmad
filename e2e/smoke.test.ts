import { test, expect } from "@playwright/test";

test("homepage returns HTTP 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

test('homepage contains "Hello World"', async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello World")).toBeVisible();
});
