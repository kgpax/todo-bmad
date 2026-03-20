import { test, expect } from "@playwright/test";
import { execSync, spawn } from "child_process";
import { deleteAllTodos, seedTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

const API_URL = "http://localhost:3001";

function killBackend() {
  try {
    // Kill only the tsx process that serves the backend
    // Using pkill -f avoids killing other processes (like Playwright workers) that
    // have connections TO port 3001
    execSync("pkill -9 -f 'tsx.*conditions=development' 2>/dev/null; exit 0", {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    // Already down or no process found
  }
}

async function waitForBackend(
  request: Parameters<Parameters<typeof test>[1]>[0]["request"],
  timeoutMs = 30_000
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await request.get(`${API_URL}/api/todos`);
      if (res.ok()) return;
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Backend did not become available within timeout");
}

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

test.describe.serial("Journey 4: Error Recovery — Initial Load Failure", () => {
  test.beforeAll(async () => {
    killBackend();
    // Wait for port to release
    await new Promise((r) => setTimeout(r, 800));
  });

  test.afterAll(async ({ request }) => {
    // Restart backend
    spawn("npm", ["run", "dev", "-w", "packages/backend"], {
      detached: true,
      stdio: "ignore",
      cwd: process.cwd(),
    }).unref();

    // Wait for backend to be available before allowing subsequent tests to run
    await waitForBackend(request);
  });

  test("initial load failure: LoadError appears with retry button", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await expect(todoPage.loadError()).toBeVisible();
    await expect(todoPage.retryButton()).toBeVisible();
  });

  test("retry succeeds: skeleton appears briefly then real content loads", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await expect(todoPage.loadError()).toBeVisible();

    // Intercept the client-side retry fetch and delay it slightly to see the skeleton
    await page.route(`${API_URL}/api/todos`, async (route) => {
      await new Promise((r) => setTimeout(r, 150));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ todos: [] }),
      });
    });

    await todoPage.retryButton().click();

    // SkeletonLoader is visible while the delayed fetch completes
    await expect(todoPage.skeletonLoader()).toBeVisible();

    // After fetch resolves, EmptyState appears (no todos)
    await expect(todoPage.emptyState).toBeVisible();
    await page.unrouteAll();
  });

  test("retry fails: skeleton appears then LoadError reappears", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await expect(todoPage.loadError()).toBeVisible();

    // Intercept the client-side retry fetch to return an error
    await page.route(`${API_URL}/api/todos`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "INTERNAL_ERROR", message: "Server error" }),
      });
    });

    await todoPage.retryButton().click();

    // LoadError reappears
    await expect(todoPage.loadError()).toBeVisible();
    await expect(todoPage.retryButton()).toBeVisible();
    await page.unrouteAll();
  });
});
