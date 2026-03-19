import { test, expect } from "@playwright/test";
import { deleteAllTodos, seedCompletedTodos, seedTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

test.describe("Journey 3: Review and Tidy", () => {
  let todo: TodoPage;

  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    todo = new TodoPage(page);
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("completing a todo applies completed styling (strikethrough, reduced opacity)", async ({ request, page }) => {
    await seedTodos(request, ["Buy groceries"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.todoByText("Buy groceries")).toBeVisible();

    await todo.toggleTodo("Buy groceries");

    await expect(todo.checkbox("Buy groceries")).toBeChecked();

    const isNowCompleted = await todo.isCompleted("Buy groceries");
    expect(isNowCompleted).toBe(true);
  });

  test("uncompleting a todo restores active styling", async ({ request, page }) => {
    await seedCompletedTodos(request, ["Walk the dog"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.checkbox("Walk the dog")).toBeChecked();

    await todo.toggleTodo("Walk the dog");

    await expect(todo.checkbox("Walk the dog")).not.toBeChecked();

    const isStillCompleted = await todo.isCompleted("Walk the dog");
    expect(isStillCompleted).toBe(false);
  });

  test("toggling one todo does not affect other todos", async ({ request, page }) => {
    await seedTodos(request, ["Todo one", "Todo two", "Todo three"]);
    todo = new TodoPage(page);
    await todo.goto();

    await todo.toggleTodo("Todo one");

    await expect(todo.checkbox("Todo one")).toBeChecked();
    await expect(todo.checkbox("Todo two")).not.toBeChecked();
    await expect(todo.checkbox("Todo three")).not.toBeChecked();
  });
});
