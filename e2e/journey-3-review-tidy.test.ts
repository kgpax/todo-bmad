import { test, expect } from "@playwright/test";
import { deleteAllTodos, seedCompletedTodos, seedTodos } from "./helpers";
import { TodoPage } from "./pages/todo-page";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe.serial("Journey 3: Review and Tidy", () => {
  let todo: TodoPage;

  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    todo = new TodoPage(page);
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test("completing a todo marks it as completed", async ({ request, page }) => {
    await seedTodos(request, ["Buy groceries"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.todoByText("Buy groceries")).toBeVisible();

    await todo.toggleTodo("Buy groceries");

    await expect(todo.checkbox("Buy groceries")).toBeChecked();

    const isNowCompleted = await todo.isCompleted("Buy groceries");
    expect(isNowCompleted).toBe(true);
  });

  test("uncompleting a todo restores it to active", async ({ request, page }) => {
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

  test("completing a todo causes the 'Completed' divider to appear and item moves below it", async ({
    request,
    page,
  }) => {
    await seedTodos(request, ["Buy groceries"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.divider()).not.toBeVisible();

    await todo.toggleTodo("Buy groceries");

    await expect(todo.divider()).toBeVisible();
    expect(await todo.isTodoBelowDivider("Buy groceries")).toBe(true);
  });

  test("uncompleting all todos causes the 'Completed' divider to disappear", async ({
    request,
    page,
  }) => {
    await seedCompletedTodos(request, ["Walk the dog"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.divider()).toBeVisible();

    await todo.toggleTodo("Walk the dog");

    await expect(todo.divider()).not.toBeVisible();
  });

  test("active items are newest-first and completed items are most-recently-completed-first", async ({
    request,
    page,
  }) => {
    // Seed active todos in order (API returns newest-first)
    await seedTodos(request, ["Oldest active"]);
    await pause(50);
    await seedTodos(request, ["Newest active"]);

    // Seed completed todos with staggered timestamps
    await seedCompletedTodos(request, ["Earlier completed"]);
    await pause(50);
    await seedCompletedTodos(request, ["Later completed"]);

    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.divider()).toBeVisible();

    const texts = await todo.orderedTodoTexts();

    // Active section: newest-first (server order)
    expect(texts[0]).toBe("Newest active");
    expect(texts[1]).toBe("Oldest active");

    // Completed section: most-recently-completed-first
    expect(texts[2]).toBe("Later completed");
    expect(texts[3]).toBe("Earlier completed");
  });

  test("deleting an active todo removes it from the list", async ({ request, page }) => {
    await seedTodos(request, ["Buy milk", "Walk the dog"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.todoByText("Buy milk")).toBeVisible();

    await todo.deleteTodo("Buy milk");

    await expect(todo.todoByText("Buy milk")).not.toBeVisible();
    await expect(todo.todoByText("Walk the dog")).toBeVisible();
  });

  test("deleting a completed todo removes it from the completed section", async ({
    request,
    page,
  }) => {
    await seedCompletedTodos(request, ["Finished reading"]);
    await seedTodos(request, ["Still active"]);
    todo = new TodoPage(page);
    await todo.goto();

    await expect(todo.divider()).toBeVisible();
    await expect(todo.todoByText("Finished reading")).toBeVisible();

    await todo.deleteTodo("Finished reading");

    await expect(todo.todoByText("Finished reading")).not.toBeVisible();
    await expect(todo.divider()).not.toBeVisible();
    await expect(todo.todoByText("Still active")).toBeVisible();
  });

  test("Journey 3 full flow: complete two, uncomplete one, delete another", async ({
    request,
    page,
  }) => {
    await seedTodos(request, ["Alpha", "Beta", "Gamma"]);
    todo = new TodoPage(page);
    await todo.goto();

    // Complete Alpha and Beta
    await todo.toggleTodo("Alpha");
    await todo.toggleTodo("Beta");

    await expect(todo.divider()).toBeVisible();
    expect(await todo.isCompleted("Alpha")).toBe(true);
    expect(await todo.isCompleted("Beta")).toBe(true);

    // Uncomplete Alpha — it should return to active section
    await todo.toggleTodo("Alpha");
    expect(await todo.isCompleted("Alpha")).toBe(false);
    expect(await todo.isTodoAboveDivider("Alpha")).toBe(true);

    // Delete Beta — it should disappear from completed section
    await todo.deleteTodo("Beta");
    await expect(todo.todoByText("Beta")).not.toBeVisible();

    // Only Alpha (active) and Gamma (active) remain — divider gone
    await expect(todo.divider()).not.toBeVisible();
    await expect(todo.todoByText("Alpha")).toBeVisible();
    await expect(todo.todoByText("Gamma")).toBeVisible();
  });
});
