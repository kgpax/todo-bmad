import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "./todo-list";
import type { TodoWithMeta } from "@/hooks/use-todos";

const now = Date.now();

const mockTodos: TodoWithMeta[] = [
  {
    id: "1",
    text: "Newest todo",
    completed: false,
    createdAt: new Date(now).toISOString(),
    completedAt: null,
  },
  {
    id: "2",
    text: "Older todo",
    completed: false,
    createdAt: new Date(now - 60000).toISOString(),
    completedAt: null,
  },
];

const noop = () => {};

describe("TodoList", () => {
  it("renders a list container with role='list'", () => {
    render(<TodoList todos={mockTodos} onToggle={noop} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders listitem wrappers for each todo", () => {
    render(<TodoList todos={mockTodos} onToggle={noop} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders todos in the provided order (newest-first from API)", () => {
    render(<TodoList todos={mockTodos} onToggle={noop} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Newest todo");
    expect(items[1]).toHaveTextContent("Older todo");
  });

  it("has aria-live='polite' for dynamic list updates", () => {
    render(<TodoList todos={mockTodos} onToggle={noop} />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-live", "polite");
  });

  it("has an accessible label", () => {
    render(<TodoList todos={mockTodos} onToggle={noop} />);
    expect(screen.getByRole("list", { name: /todo list/i })).toBeInTheDocument();
  });

  it("renders nothing if todos array is empty", () => {
    render(<TodoList todos={[]} onToggle={noop} />);
    const list = screen.getByRole("list");
    expect(list).toBeEmptyDOMElement();
  });

  it("calls onToggle with todo id when a checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<TodoList todos={mockTodos} onToggle={onToggle} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("passes pendingAction to each TodoItem", () => {
    const todosWithPending: TodoWithMeta[] = [
      { ...mockTodos[0], pendingAction: "toggling" },
      mockTodos[1],
    ];
    render(<TodoList todos={todosWithPending} onToggle={noop} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();
  });
});
