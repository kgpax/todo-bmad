import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoPage } from "./todo-page";
import type { Todo } from "@todo-bmad/shared";

jest.mock("@/lib/api", () => ({
  createTodo: jest.fn(),
  toggleTodo: jest.fn(),
  deleteTodo: jest.fn(),
  fetchTodosClient: jest.fn(),
}));

jest.mock("@/lib/actions", () => ({
  revalidateHome: jest.fn().mockResolvedValue(undefined),
}));

import { createTodo, toggleTodo, deleteTodo, fetchTodosClient } from "@/lib/api";

const mockCreateTodo = createTodo as jest.MockedFunction<typeof createTodo>;
const mockToggleTodo = toggleTodo as jest.MockedFunction<typeof toggleTodo>;
const mockDeleteTodo = deleteTodo as jest.MockedFunction<typeof deleteTodo>;
const mockFetchTodosClient = fetchTodosClient as jest.MockedFunction<typeof fetchTodosClient>;

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

type AlertType = "load" | "create" | "toggle" | "delete";

function getAlertByType(type: AlertType) {
  return screen.getByRole("alert", {
    name: (_accessibleName, element) =>
      element.getAttribute("data-alert-type") === type,
  });
}

function queryAlertByType(type: AlertType) {
  return screen.queryByRole("alert", {
    name: (_accessibleName, element) =>
      element.getAttribute("data-alert-type") === type,
  });
}

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

  it("shows error callout when create fails", async () => {
    mockCreateTodo.mockRejectedValue({ message: "Server error" });
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(getAlertByType("create")).toBeInTheDocument();
    });
  });

  it("passes createError and cachedCreateText props to TodoInput — error clears on re-type", async () => {
    mockCreateTodo.mockRejectedValue({ message: "Server error" });
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(getAlertByType("create")).toBeInTheDocument();
    });

    // Typing again should clear the error via onClearError
    fireEvent.change(input, { target: { value: "a" } });

    await waitFor(() => {
      expect(queryAlertByType("create")).not.toBeInTheDocument();
    });
  });

  it("shows item error callout when toggle fails", async () => {
    const user = userEvent.setup();
    mockToggleTodo.mockRejectedValue({ message: "Network failure" });
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(getAlertByType("toggle")).toBeInTheDocument();
    });
  });

  it("shows item error callout when delete fails", async () => {
    const user = userEvent.setup();
    mockDeleteTodo.mockRejectedValue({ message: "Network failure" });
    render(<TodoPage initialTodos={[existingTodo]} emptyMessage="Nothing here yet" />);

    await user.click(screen.getByRole("button", { name: `Delete: ${existingTodo.text}` }));

    await waitFor(() => {
      expect(getAlertByType("delete")).toBeInTheDocument();
    });
  });

  // LoadError / SkeletonLoader tests
  it("renders LoadError when fetchFailed=true", () => {
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);
    expect(getAlertByType("load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry loading todos/i })).toBeInTheDocument();
  });

  it("does not render LoadError when fetchFailed is false (default)", () => {
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" />);
    expect(screen.queryByRole("button", { name: /retry loading todos/i })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("SkeletonLoader renders during retry (isLoading=true)", async () => {
    let resolveClient!: (value: typeof existingTodo[]) => void;
    mockFetchTodosClient.mockReturnValue(
      new Promise<typeof existingTodo[]>((resolve) => {
        resolveClient = resolve;
      })
    );

    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    fireEvent.click(screen.getByRole("button", { name: /retry loading todos/i }));

    await waitFor(() => {
      expect(screen.getByRole("list", { name: /loading todos/i })).toBeInTheDocument();
    });

    await act(async () => {
      resolveClient([]);
    });
  });

  it("retry success: LoadError transitions to content", async () => {
    mockFetchTodosClient.mockResolvedValue([existingTodo]);
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    fireEvent.click(screen.getByRole("button", { name: /retry loading todos/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /retry loading todos/i })).not.toBeInTheDocument();
      expect(screen.getByText(existingTodo.text)).toBeInTheDocument();
    });
  });

  it("retry success with empty list: shows EmptyState", async () => {
    mockFetchTodosClient.mockResolvedValue([]);
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    fireEvent.click(screen.getByRole("button", { name: /retry loading todos/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /retry loading todos/i })).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("transitions from LoadError to TodoList after successful addTodo", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    expect(getAlertByType("load")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Walk the dog" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(queryAlertByType("load")).not.toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Walk the dog")).toBeInTheDocument();
    });
  });

  it("keeps LoadError visible after failed addTodo, shows create error callout", async () => {
    mockCreateTodo.mockRejectedValue({ message: "Server error" });
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    expect(getAlertByType("load")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Walk the dog" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(getAlertByType("load")).toBeInTheDocument();
      expect(getAlertByType("create")).toBeInTheDocument();
    });
  });

  it("retry failure: LoadError reappears after failed retry", async () => {
    mockFetchTodosClient.mockRejectedValue({ error: "INTERNAL_ERROR" });
    render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

    fireEvent.click(screen.getByRole("button", { name: /retry loading todos/i }));

    await waitFor(() => {
      expect(getAlertByType("load")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry loading todos/i })).toBeInTheDocument();
    });
  });
});
