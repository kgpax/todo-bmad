import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "./todo-item";
import type { Todo } from "@todo-bmad/shared";

const mockActiveTodo: Todo = {
  id: "test-id-1",
  text: "Buy groceries",
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
};

const mockCompletedTodo: Todo = {
  id: "test-id-2",
  text: "Walk the dog",
  completed: true,
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
};

const noop = () => {};

describe("TodoItem", () => {
  it("displays the todo text", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("displays a formatted timestamp in DD/MM/YYYY HH:mm format", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(screen.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it("renders a checkbox for active todo in unchecked state", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders a checkbox for completed todo in checked state", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} onDelete={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("checkbox has descriptive aria-label for active todo", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", `Mark ${mockActiveTodo.text} as complete`);
  });

  it("checkbox has descriptive aria-label for completed todo", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} onDelete={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", `Mark ${mockCompletedTodo.text} as active`);
  });

  it("calls onToggle with todo id when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<TodoItem todo={mockActiveTodo} onToggle={onToggle} onDelete={noop} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(mockActiveTodo.id);
  });

  it("completed todo card has data-completed=true", () => {
    const { container } = render(<TodoItem todo={mockCompletedTodo} onToggle={noop} onDelete={noop} />);
    expect(container.firstChild).toHaveAttribute("data-completed", "true");
  });

  it("active todo card has data-completed=false", () => {
    const { container } = render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(container.firstChild).toHaveAttribute("data-completed", "false");
  });

  it("checkbox is disabled and has pending class when pendingAction is toggling", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} pendingAction="toggling" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("checkbox is not disabled when no pendingAction", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeDisabled();
  });

  // Delete button tests
  it("renders a delete button with correct aria-label", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(
      screen.getByRole("button", { name: `Delete: ${mockActiveTodo.text}` })
    ).toBeInTheDocument();
  });

  it("delete button aria-label includes the todo text for completed todos", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} onDelete={noop} />);
    expect(
      screen.getByRole("button", { name: `Delete: ${mockCompletedTodo.text}` })
    ).toBeInTheDocument();
  });

  it("calls onDelete with todo id when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: `Delete: ${mockActiveTodo.text}` }));
    expect(onDelete).toHaveBeenCalledWith(mockActiveTodo.id);
  });

  it("delete button is disabled when pendingAction is set", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} pendingAction="toggling" />);
    expect(
      screen.getByRole("button", { name: `Delete: ${mockActiveTodo.text}` })
    ).toBeDisabled();
  });

  it("delete button is disabled when pendingAction is deleting", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} pendingAction="deleting" />);
    expect(
      screen.getByRole("button", { name: `Delete: ${mockActiveTodo.text}` })
    ).toBeDisabled();
  });

  it("delete button is not disabled when no pendingAction", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(
      screen.getByRole("button", { name: `Delete: ${mockActiveTodo.text}` })
    ).not.toBeDisabled();
  });

  it("card has data-pending-deleting attribute when pendingAction is deleting", () => {
    const { container } = render(
      <TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} pendingAction="deleting" />
    );
    expect(container.firstChild).toHaveAttribute("data-pending-deleting", "true");
  });

  it("card does not have data-pending-deleting when no pendingAction", () => {
    const { container } = render(<TodoItem todo={mockActiveTodo} onToggle={noop} onDelete={noop} />);
    expect(container.firstChild).not.toHaveAttribute("data-pending-deleting", "true");
  });
});
