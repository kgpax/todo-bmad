import { test, expect } from "@playwright/test";
import { deleteAllTodos, seedTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

const API_URL = "http://localhost:3001";

test.describe.serial("Journey 4: Error Recovery — Mutation Errors", () => {
  let todo: TodoPage;

  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("create failure: error callout appears, restore text, retry succeeds, callout disappears", async ({
    page,
    request,
  }) => {
    // Intercept the first POST to return 500
    await page.route(`${API_URL}/api/todos`, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "INTERNAL_ERROR", message: "Server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await todo.input.fill("Buy groceries");
    await todo.input.press("Enter");

    // Error callout appears with role="alert"
    const createCallout = todo.createErrorCallout();
    await expect(createCallout).toBeVisible();
    await expect(createCallout).toHaveAttribute("role", "alert");

    // Remove the route intercept so the retry succeeds
    await page.unrouteAll();

    // Restore the text and retry
    await todo.restoreText();
    await expect(todo.input).toHaveValue("Buy groceries");
    await todo.input.press("Enter");

    // Error callout disappears after success
    await expect(createCallout).not.toBeVisible();
    await expect(todo.todoItems()).toHaveCount(1);
  });

  test("toggle failure: item error callout appears, retry succeeds, callout disappears", async ({
    page,
    request,
  }) => {
    await seedTodos(request, ["Walk the dog"]);
    await page.reload();

    // Intercept the first PATCH to return 500
    await page.route(`${API_URL}/api/todos/**`, async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "INTERNAL_ERROR", message: "Server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await todo.toggleTodo("Walk the dog");

    // Error callout appears near the item
    const itemCallout = todo.getItemErrorCallout("Walk the dog");
    await expect(itemCallout).toBeVisible();
    await expect(itemCallout).toHaveAttribute("role", "alert");

    // Remove the route intercept so the retry succeeds
    await page.unrouteAll();

    // Retry by toggling again
    await todo.toggleTodo("Walk the dog");

    // Error callout disappears
    await expect(itemCallout).not.toBeVisible();
  });

  test("delete failure: item error callout appears, retry succeeds, callout disappears", async ({
    page,
    request,
  }) => {
    await seedTodos(request, ["Take out trash"]);
    await page.reload();

    // Intercept the first DELETE to return 500
    await page.route(`${API_URL}/api/todos/**`, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "INTERNAL_ERROR", message: "Server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await todo.deleteTodo("Take out trash");

    // Error callout appears near the item
    const itemCallout = todo.getItemErrorCallout("Take out trash");
    await expect(itemCallout).toBeVisible();
    await expect(itemCallout).toHaveAttribute("role", "alert");

    // Remove the route intercept so the retry succeeds
    await page.unrouteAll();

    // Retry by deleting again
    await todo.deleteTodo("Take out trash");

    // Todo is removed
    await expect(todo.todoByText("Take out trash")).not.toBeVisible();
  });
});

