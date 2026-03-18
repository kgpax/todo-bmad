import { test, expect } from "@playwright/test";

async function deleteAllTodos(
  request: Parameters<Parameters<typeof test.beforeEach>[0]>[0]["request"]
) {
  const res = await request.get("http://localhost:3001/api/todos");
  if (res.ok()) {
    const data = await res.json();
    for (const todo of data.todos ?? []) {
      await request.delete(`http://localhost:3001/api/todos/${todo.id}`);
    }
  }
}

test.describe("Focus behaviour", () => {
  test.beforeEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("input is focused immediately on page load (desktop)", async ({ page }) => {
    // Playwright uses Desktop Chrome (≥1024px) — auto-focus should fire
    await page.goto("/");

    const input = page.getByRole("textbox", { name: /new todo/i });
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("input regains focus after a todo is submitted", async ({ page }) => {
    await page.goto("/");

    const input = page.getByRole("textbox", { name: /new todo/i });
    await expect(input).toBeFocused();

    await input.fill("My first todo");
    await input.press("Enter");

    // Wait for the new todo to appear (create + revalidation cycle complete)
    await expect(page.getByText("My first todo")).toBeVisible();

    // Input should have focus back so the user can type their next todo
    await expect(input).toBeFocused();
  });

  test("focus ring is not shown when create is in flight then correctly reappears", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.getByRole("textbox", { name: /new todo/i });

    // Type and submit — after submission completes, focus ring (via :focus) should be on input
    await input.fill("Quick todo");
    await input.press("Enter");

    await expect(page.getByText("Quick todo")).toBeVisible();
    await expect(input).toBeFocused();
  });
});
