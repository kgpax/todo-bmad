import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoList } from "./todo-list";
import type { Todo } from "@todo-bmad/shared";

const now = Date.now();

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "Newest todo",
    completed: false,
    createdAt: new Date(now).toISOString(),
  },
  {
    id: "2",
    text: "Older todo",
    completed: false,
    createdAt: new Date(now - 60000).toISOString(),
  },
];

describe("TodoList", () => {
  it("renders a list container with role='list'", () => {
    render(<TodoList todos={mockTodos} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders listitem wrappers for each todo", () => {
    render(<TodoList todos={mockTodos} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders todos in the provided order (newest-first from API)", () => {
    render(<TodoList todos={mockTodos} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Newest todo");
    expect(items[1]).toHaveTextContent("Older todo");
  });

  it("has aria-live='polite' for dynamic list updates", () => {
    render(<TodoList todos={mockTodos} />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-live", "polite");
  });

  it("has an accessible label", () => {
    render(<TodoList todos={mockTodos} />);
    expect(screen.getByRole("list", { name: /todo list/i })).toBeInTheDocument();
  });

  it("renders nothing if todos array is empty", () => {
    render(<TodoList todos={[]} />);
    const list = screen.getByRole("list");
    expect(list).toBeEmptyDOMElement();
  });
});
