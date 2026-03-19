import { type Locator, type Page } from "@playwright/test";

const FOCUS_RING_PATTERN = /0px 0px 0px 3px/;

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
    return this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: todoText })
      .getByRole("checkbox");
  }

  async toggleTodo(text: string) {
    await this.checkbox(text).click();
  }

  async isCompleted(text: string): Promise<boolean> {
    const item = this.todoList
      .locator('[role="listitem"]')
      .filter({ hasText: text });
    const card = item.locator("> div").first();
    const classes = await card.getAttribute("class");
    return classes?.includes("opacity-70") ?? false;
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
}
