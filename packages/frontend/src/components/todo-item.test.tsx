import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodoItem } from "./todo-item";
import type { Todo } from "@todo-bmad/shared";

const mockTodo: Todo = {
  id: "test-id-1",
  text: "Buy groceries",
  completed: false,
  createdAt: new Date().toISOString(),
};

describe("TodoItem", () => {
  it("renders as a card", () => {
    const { container } = render(<TodoItem todo={mockTodo} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-surface", "rounded-xl");
  });

  it("displays the todo text", () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("displays a relative timestamp", () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("displays 'Xm ago' for a todo created minutes ago", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const todo: Todo = { ...mockTodo, createdAt: fiveMinutesAgo };
    render(<TodoItem todo={todo} />);
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("applies resting shadow via inline style", () => {
    const { container } = render(<TodoItem todo={mockTodo} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.boxShadow).toBe("var(--shadow-resting)");
  });

  it("applies hover shadow on mouseenter", () => {
    const { container } = render(<TodoItem todo={mockTodo} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    expect(card.style.boxShadow).toBe("var(--shadow-hover)");
  });

  it("restores resting shadow on mouseleave", () => {
    const { container } = render(<TodoItem todo={mockTodo} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(card.style.boxShadow).toBe("var(--shadow-resting)");
  });
});
