import { test, expect } from "@playwright/test";

test.describe("Frontend smoke tests", () => {
  test("homepage loads with HTTP 200 and no error page", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test('homepage renders "Hello World" heading', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hello World" })).toBeVisible();
  });

  test("Tailwind CSS and jiti load without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");

    const jitiError = errors.find((e) => e.includes("jiti") || e.includes("Cannot find module"));
    expect(jitiError).toBeUndefined();
  });

  test("page has no server error content", async ({ page }) => {
    await page.goto("/");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Cannot find module");
    expect(bodyText).not.toContain("Error evaluating Node.js code");
  });
});
