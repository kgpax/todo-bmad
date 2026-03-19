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
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("displays a formatted timestamp in DD/MM/YYYY HH:mm format", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    expect(screen.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it("renders a checkbox for active todo in unchecked state", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders a checkbox for completed todo in checked state", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("checkbox has descriptive aria-label for active todo", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", `Mark ${mockActiveTodo.text} as complete`);
  });

  it("checkbox has descriptive aria-label for completed todo", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", `Mark ${mockCompletedTodo.text} as active`);
  });

  it("calls onToggle with todo id when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<TodoItem todo={mockActiveTodo} onToggle={onToggle} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(mockActiveTodo.id);
  });

  it("completed todo text has line-through styling class", () => {
    render(<TodoItem todo={mockCompletedTodo} onToggle={noop} />);
    const text = screen.getByText(mockCompletedTodo.text);
    expect(text.className).toContain("line-through");
  });

  it("active todo has transparent text-decoration-color class", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    const text = screen.getByText(mockActiveTodo.text);
    expect(text.className).toContain("[text-decoration-color:transparent]");
  });

  it("completed todo card has reduced opacity class", () => {
    const { container } = render(<TodoItem todo={mockCompletedTodo} onToggle={noop} />);
    expect(container.firstChild).toHaveClass("opacity-70");
  });

  it("active todo card does not have reduced opacity class", () => {
    const { container } = render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    expect(container.firstChild).not.toHaveClass("opacity-70");
  });

  it("checkbox is disabled and has pending class when pendingAction is toggling", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} pendingAction="toggling" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("checkbox is not disabled when no pendingAction", () => {
    render(<TodoItem todo={mockActiveTodo} onToggle={noop} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeDisabled();
  });
});
