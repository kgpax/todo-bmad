import { type Locator, type Page } from "@playwright/test";

const FOCUS_RING_PATTERN = /0px 0px 0px 3px/;

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class TodoPage {
  readonly page: Page;
  readonly input: Locator;
  readonly inputCard: Locator;
  readonly emptyState: Locator;
  readonly todoList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.input = page.getByRole("textbox", { name: /new todo/i });
    this.inputCard = this.input.locator("xpath=..");
    this.emptyState = page.locator('[role="status"]');
    this.todoList = page.getByRole("list", { name: /todo list/i });
  }

  async goto() {
    await this.page.goto("/");
  }

  async addTodo(text: string) {
    await this.input.fill(text);
    await this.input.press("Enter");
  }

  todoItems() {
    return this.todoList.getByRole("listitem");
  }

  todoByText(text: string) {
    return this.todoList.getByText(text);
  }

  checkbox(todoText: string) {
    // Exclude [data-disabled] to avoid matching auto-animate exit-animation clones,
    // which are briefly in the DOM alongside the real element during FLIP transitions.
    return this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: todoText })
      .locator('[role="checkbox"]:not([data-disabled])');
  }

  divider() {
    return this.todoList.locator('[role="separator"]');
  }

  /**
   * Returns the todo text (first <p>) for each listitem in DOM order.
   * Because the divider has role="separator" (not "listitem"), it is excluded.
   * Active items come first, then completed items.
   */
  async orderedTodoTexts(): Promise<string[]> {
    const items = this.todoList.locator('[role="listitem"]');
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).locator("p").first().textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  async isTodoAboveDivider(text: string): Promise<boolean> {
    const item = this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: text })
      .first();
    const divider = this.divider();
    return item.evaluate((itemEl, dividerEl) => {
      const siblings = Array.from(itemEl.parentElement!.children);
      return siblings.indexOf(itemEl) < siblings.indexOf(dividerEl as Element);
    }, await divider.elementHandle());
  }

  async isTodoBelowDivider(text: string): Promise<boolean> {
    const item = this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: text })
      .first();
    const divider = this.divider();
    return item.evaluate((itemEl, dividerEl) => {
      const siblings = Array.from(itemEl.parentElement!.children);
      return siblings.indexOf(itemEl) > siblings.indexOf(dividerEl as Element);
    }, await divider.elementHandle());
  }

  deleteButton(todoText: string) {
    return this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: todoText })
      .getByRole("button", { name: new RegExp(`Delete:.*${escapeRegExp(todoText)}`, "i") });
  }

  async deleteTodo(todoText: string) {
    await this.deleteButton(todoText).click();
  }

  async toggleTodo(text: string) {
    await this.checkbox(text).click();
  }

  async isCompleted(text: string): Promise<boolean> {
    // Use the enabled checkbox's checked state rather than data-completed, so that
    // auto-animate exit-animation clones (which have [data-disabled]) are excluded.
    const checkbox = this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: text })
      .locator('[role="checkbox"]:not([data-disabled])');
    return await checkbox.isChecked();
  }

  /**
   * Checks whether the input card's computed box-shadow contains the
   * 3px spread ring that signals the focus ring is visible.
   */
  async hasFocusRing(): Promise<boolean> {
    const boxShadow = await this.inputCard.evaluate(
      (el) => getComputedStyle(el).boxShadow
    );
    return FOCUS_RING_PATTERN.test(boxShadow);
  }

  /**
   * Returns the create error callout by its stable id.
   * This avoids matching the Next.js route announcer which also uses role="alert".
   */
  createErrorCallout() {
    return this.page.locator('[id="error-callout-create"]');
  }

  /**
   * Returns the error callout (role="alert") for a specific todo item.
   * Uses the stable id pattern: error-callout-{todoId}.
   */
  getItemErrorCallout(todoText: string) {
    return this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: todoText })
      .locator('[role="alert"]:not([id="__next-route-announcer__"])');
  }

  /**
   * Clicks the "Restore" button inside the create error callout.
   */
  async restoreText() {
    await this.page.getByRole("button", { name: /restore/i }).click();
  }

  /**
   * Returns true if the element for the given todo has data-error-animate="true".
   */
  async isCardShaking(todoText: string): Promise<boolean> {
    const card = this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: todoText })
      .locator("[data-completed]");
    return (await card.getAttribute("data-error-animate")) === "true";
  }
}
