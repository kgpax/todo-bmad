import { test, expect } from "@playwright/test";
import { deleteAllTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

test.describe.serial("Journey 1: First Visit", () => {
  let todo: TodoPage;

  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("shows empty state when there are no todos", async () => {
    await expect(todo.emptyState).toBeVisible();
  });

  test("auto-focuses the input with focus ring on desktop", async () => {
    await expect(todo.input).toBeVisible();
    await expect(todo.input).toBeFocused();
    await expect.poll(() => todo.hasFocusRing()).toBe(true);
  });

  test("creates a todo that appears in the list with a timestamp", async () => {
    await todo.addTodo("Buy coffee");

    await expect(todo.emptyState).not.toBeVisible();
    await expect(todo.todoList).toBeVisible();
    await expect(todo.todoByText("Buy coffee")).toBeVisible();
    await expect(
      todo.todoList.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
    ).toBeVisible();
  });

  test("disables input during create then restores focus with ring", async () => {
    // The local API responds faster than Playwright's assertion polling
    // interval, so the input's transient disabled state is never observed.
    // Delaying the POST gives the assertion time to catch it.
    await todo.page.route("**/api/todos", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await route.continue();
    });

    await todo.addTodo("Buy coffee");

    await expect(todo.input).toBeDisabled();
    await expect(todo.input).toBeEnabled();
    await expect(todo.input).toBeFocused();
    await expect.poll(() => todo.hasFocusRing()).toBe(true);
  });
});
