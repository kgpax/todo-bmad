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

test.describe("Journey 2: Quick Capture", () => {
  test.beforeEach(async ({ request }) => {
    await deleteAllTodos(request);

    // Seed 2 todos via backend API
    await request.post("http://localhost:3001/api/todos", {
      data: { text: "Existing todo one" },
    });
    await request.post("http://localhost:3001/api/todos", {
      data: { text: "Existing todo two" },
    });
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("returning user with existing todos adds a new todo that appears at top", async ({
    page,
  }) => {
    await page.goto("/");

    // Existing todos are visible
    const list = page.getByRole("list", { name: /todo list/i });
    await expect(list).toBeVisible();
    await expect(list.getByText("Existing todo one")).toBeVisible();
    await expect(list.getByText("Existing todo two")).toBeVisible();

    // Add a new todo
    const input = page.getByRole("textbox", { name: /new todo/i });
    await input.fill("Brand new todo");
    await input.press("Enter");

    // New todo appears at the TOP of the list
    const listItems = list.getByRole("listitem");
    await expect(listItems.first()).toContainText("Brand new todo");

    // Existing todos are still visible below
    await expect(list.getByText("Existing todo one")).toBeVisible();
    await expect(list.getByText("Existing todo two")).toBeVisible();
  });
});
