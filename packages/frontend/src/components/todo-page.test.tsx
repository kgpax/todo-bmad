import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoPage } from "./todo-page";
import type { Todo } from "@todo-bmad/shared";

jest.mock("@/lib/api", () => ({
  createTodo: jest.fn(),
  toggleTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

jest.mock("@/lib/actions", () => ({
  revalidateHome: jest.fn().mockResolvedValue(undefined),
}));

import { createTodo, toggleTodo, deleteTodo } from "@/lib/api";

const mockCreateTodo = createTodo as jest.MockedFunction<typeof createTodo>;
const mockToggleTodo = toggleTodo as jest.MockedFunction<typeof toggleTodo>;
const mockDeleteTodo = deleteTodo as jest.MockedFunction<typeof deleteTodo>;

const existingTodo: Todo = {
  id: "existing-1",
  text: "Existing todo",
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
};

const newTodo: Todo = {
  id: "new-1",
  text: "Walk the dog",
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
};

const completedVersion: Todo = {
  ...existingTodo,
  completed: true,
  completedAt: new Date().toISOString(),
};

describe("TodoPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no todos", () => {
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders TodoList when todos exist", () => {
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("Existing todo")).toBeInTheDocument();
  });

  it("always renders the TodoInput", () => {
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);
    expect(screen.getByRole("textbox", { name: /new todo/i })).toBeInTheDocument();
  });

  it("adds a new todo to the list after submission", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Walk the dog" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Walk the dog")).toBeInTheDocument();
    });
  });

  it("transitions from empty state to list after adding first todo", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Walk the dog" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });

  it("wires toggleTodo through to the TodoList checkboxes", async () => {
    const user = userEvent.setup();
    mockToggleTodo.mockResolvedValue(completedVersion);
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockToggleTodo).toHaveBeenCalledWith(existingTodo.id, true);
    });
  });

  it("updates todo to completed state after successful toggle", async () => {
    const user = userEvent.setup();
    mockToggleTodo.mockResolvedValue(completedVersion);
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  it("wires deleteTodo through to the TodoList delete buttons", async () => {
    const user = userEvent.setup();
    mockDeleteTodo.mockResolvedValue(undefined);
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    const deleteButton = screen.getByRole("button", { name: `Delete: ${existingTodo.text}` });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith(existingTodo.id);
    });
  });

  it("removes todo from list after successful delete", async () => {
    const user = userEvent.setup();
    mockDeleteTodo.mockResolvedValue(undefined);
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    const deleteButton = screen.getByRole("button", { name: `Delete: ${existingTodo.text}` });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(existingTodo.text)).not.toBeInTheDocument();
    });
  });
});
