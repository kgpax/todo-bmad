import { test, expect } from "@playwright/test";

async function deleteAllTodos(request: Parameters<Parameters<typeof test.beforeEach>[0]>[0]["request"]) {
  const todosResponse = await request.get("http://localhost:3001/api/todos");
  if (todosResponse.ok()) {
    const data = await todosResponse.json();
    const todos = data.todos ?? [];
    for (const todo of todos) {
      await request.delete(`http://localhost:3001/api/todos/${todo.id}`);
    }
  }
}

test.describe("Journey 1: First Visit", () => {
  test.beforeEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("user opens app, sees empty state, creates first todo, todo appears in list", async ({
    page,
  }) => {
    await page.goto("/");

    // Empty state is visible
    const emptyState = page.locator('[role="status"]');
    await expect(emptyState).toBeVisible();

    // Input is visible
    const input = page.getByRole("textbox", { name: /new todo/i });
    await expect(input).toBeVisible();

    // Type a todo
    await input.fill("Buy coffee");
    await input.press("Enter");

    // Empty state disappears
    await expect(emptyState).not.toBeVisible();

    // New todo appears in the list
    const list = page.getByRole("list", { name: /todo list/i });
    await expect(list).toBeVisible();
    await expect(list.getByText("Buy coffee")).toBeVisible();

    // Timestamp shows absolute DD/MM/YYYY HH:mm format
    await expect(list.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)).toBeVisible();
  });
});
