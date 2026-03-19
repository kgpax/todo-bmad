import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "./todo-list";
import type { TodoWithMeta } from "@/hooks/use-todos";

const activeTodo1: TodoWithMeta = {
  id: "a1",
  text: "Newer active",
  completed: false,
  createdAt: "2026-03-19T10:00:00.000Z",
  completedAt: null,
};

const activeTodo2: TodoWithMeta = {
  id: "a2",
  text: "Older active",
  completed: false,
  createdAt: "2026-03-19T09:00:00.000Z",
  completedAt: null,
};

const completedTodo1: TodoWithMeta = {
  id: "c1",
  text: "Recently completed",
  completed: true,
  createdAt: "2026-03-19T08:00:00.000Z",
  completedAt: "2026-03-19T10:30:00.000Z",
};

const completedTodo2: TodoWithMeta = {
  id: "c2",
  text: "Earlier completed",
  completed: true,
  createdAt: "2026-03-19T07:00:00.000Z",
  completedAt: "2026-03-19T09:30:00.000Z",
};

const noop = () => {};

describe("TodoList", () => {
  it("renders a list container with role='list'", () => {
    render(<TodoList todos={[activeTodo1]} onToggle={noop} onDelete={noop} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("has aria-live='polite' for dynamic list updates", () => {
    render(<TodoList todos={[activeTodo1]} onToggle={noop} onDelete={noop} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-live", "polite");
  });

  it("has an accessible label", () => {
    render(<TodoList todos={[activeTodo1]} onToggle={noop} onDelete={noop} />);
    expect(screen.getByRole("list", { name: /todo list/i })).toBeInTheDocument();
  });

  it("renders nothing if todos array is empty", () => {
    render(<TodoList todos={[]} onToggle={noop} onDelete={noop} />);
    expect(screen.getByRole("list")).toBeEmptyDOMElement();
  });

  it("calls onToggle with todo id when a checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<TodoList todos={[activeTodo1, activeTodo2]} onToggle={onToggle} onDelete={noop} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith("a1");
  });

  it("calls onDelete with todo id when a delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<TodoList todos={[activeTodo1, activeTodo2]} onToggle={noop} onDelete={onDelete} />);
    const deleteButton = screen.getByRole("button", { name: `Delete: ${activeTodo1.text}` });
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("a1");
  });

  it("passes pendingAction to each TodoItem", () => {
    const todosWithPending: TodoWithMeta[] = [
      { ...activeTodo1, pendingAction: "toggling" },
      activeTodo2,
    ];
    render(<TodoList todos={todosWithPending} onToggle={noop} onDelete={noop} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();
  });

  // Divider visibility

  it("renders divider with role='separator' when both active and completed todos exist", () => {
    render(
      <TodoList todos={[activeTodo1, completedTodo1]} onToggle={noop} onDelete={noop} />
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("divider displays 'Completed' text when rendered", () => {
    render(
      <TodoList todos={[activeTodo1, completedTodo1]} onToggle={noop} onDelete={noop} />
    );
    expect(screen.getByRole("separator")).toHaveTextContent(/completed/i);
  });

  it("does NOT render divider when no completed todos exist", () => {
    render(<TodoList todos={[activeTodo1, activeTodo2]} onToggle={noop} onDelete={noop} />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("renders divider when ALL todos are completed", () => {
    render(
      <TodoList todos={[completedTodo1, completedTodo2]} onToggle={noop} onDelete={noop} />
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  // Section ordering

  it("renders active items in provided order (newest-first from API)", () => {
    render(
      <TodoList todos={[activeTodo1, activeTodo2]} onToggle={noop} onDelete={noop} />
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Newer active");
    expect(items[1]).toHaveTextContent("Older active");
  });

  it("renders completed items ordered by completedAt descending (most recently completed first)", () => {
    render(
      <TodoList todos={[completedTodo2, completedTodo1]} onToggle={noop} onDelete={noop} />
    );
    // completedTodo1 has later completedAt, so appears first
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Recently completed");
    expect(items[1]).toHaveTextContent("Earlier completed");
  });

  it("renders active items before completed items in the DOM", () => {
    render(
      <TodoList
        todos={[activeTodo1, activeTodo2, completedTodo1, completedTodo2]}
        onToggle={noop}
        onDelete={noop}
      />
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Newer active");
    expect(items[1]).toHaveTextContent("Older active");
    expect(items[2]).toHaveTextContent("Recently completed");
    expect(items[3]).toHaveTextContent("Earlier completed");
  });

  it("handles a.completedAt=null gracefully (null first in input, sorts to end)", () => {
    const completedNoDate: TodoWithMeta = {
      id: "c3",
      text: "No date completed",
      completed: true,
      createdAt: "2026-03-19T06:00:00.000Z",
      completedAt: null,
    };
    render(
      <TodoList todos={[completedNoDate, completedTodo1]} onToggle={noop} onDelete={noop} />
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Recently completed");
    expect(items[1]).toHaveTextContent("No date completed");
  });

  it("handles b.completedAt=null gracefully (null second in input, sorts to end)", () => {
    const completedNoDate: TodoWithMeta = {
      id: "c3",
      text: "No date completed",
      completed: true,
      createdAt: "2026-03-19T06:00:00.000Z",
      completedAt: null,
    };
    render(
      <TodoList todos={[completedTodo1, completedNoDate]} onToggle={noop} onDelete={noop} />
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Recently completed");
    expect(items[1]).toHaveTextContent("No date completed");
  });

  it("renders listitem wrappers for all todos", () => {
    render(
      <TodoList
        todos={[activeTodo1, activeTodo2, completedTodo1, completedTodo2]}
        onToggle={noop}
        onDelete={noop}
      />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
