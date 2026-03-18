import { test, expect } from "@playwright/test";
import { deleteAllTodos, seedTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

test.describe("Journey 2: Quick Capture", () => {
  let todo: TodoPage;

  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    await seedTodos(request, ["Existing todo one", "Existing todo two"]);
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("displays existing todos on page load", async () => {
    await expect(todo.todoList).toBeVisible();
    await expect(todo.todoByText("Existing todo one")).toBeVisible();
    await expect(todo.todoByText("Existing todo two")).toBeVisible();
  });

  test("new todo appears at the top of the list", async () => {
    await todo.addTodo("Brand new todo");

    await expect(todo.todoItems().first()).toContainText("Brand new todo");
  });

  test("existing todos remain visible after adding a new one", async () => {
    await todo.addTodo("Brand new todo");

    await expect(todo.todoByText("Brand new todo")).toBeVisible();
    await expect(todo.todoByText("Existing todo one")).toBeVisible();
    await expect(todo.todoByText("Existing todo two")).toBeVisible();
  });
});
