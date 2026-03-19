import { renderHook, act } from "@testing-library/react";
import { useTodos } from "./use-todos";
import type { Todo } from "@todo-bmad/shared";

jest.mock("@/lib/api", () => ({
  createTodo: jest.fn(),
  toggleTodo: jest.fn(),
}));

jest.mock("@/lib/actions", () => ({
  revalidateHome: jest.fn().mockResolvedValue(undefined),
}));

import { createTodo, toggleTodo } from "@/lib/api";

const mockCreateTodo = createTodo as jest.MockedFunction<typeof createTodo>;
const mockToggleTodo = toggleTodo as jest.MockedFunction<typeof toggleTodo>;

const existingTodo: Todo = {
  id: "existing-1",
  text: "Existing todo",
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
};

const newTodo: Todo = {
  id: "new-1",
  text: "New todo",
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
};

const completedTodo: Todo = {
  ...existingTodo,
  completed: true,
  completedAt: new Date().toISOString(),
};

describe("useTodos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes todos from initialTodos prop", () => {
    const { result } = renderHook(() => useTodos([existingTodo]));
    expect(result.current.todos).toEqual([existingTodo]);
  });

  it("initializes with empty todos if none provided", () => {
    const { result } = renderHook(() => useTodos([]));
    expect(result.current.todos).toEqual([]);
  });

  it("sets placeholderContext to 'empty' when no todos", () => {
    const { result } = renderHook(() => useTodos([]));
    expect(result.current.placeholderContext).toBe("empty");
  });

  it("sets placeholderContext to 'hasItems' when todos exist", () => {
    const { result } = renderHook(() => useTodos([existingTodo]));
    expect(result.current.placeholderContext).toBe("hasItems");
  });

  it("ignores addTodo when text is empty", async () => {
    const { result } = renderHook(() => useTodos([]));
    await act(async () => {
      await result.current.addTodo("");
    });
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("ignores addTodo when text is whitespace only", async () => {
    const { result } = renderHook(() => useTodos([]));
    await act(async () => {
      await result.current.addTodo("   ");
    });
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("sets isCreating to true during API call", async () => {
    let resolveCreate!: (value: Todo) => void;
    mockCreateTodo.mockReturnValue(
      new Promise<Todo>((resolve) => {
        resolveCreate = resolve;
      })
    );

    const { result } = renderHook(() => useTodos([]));

    act(() => {
      result.current.addTodo("New todo");
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveCreate(newTodo);
    });

    expect(result.current.isCreating).toBe(false);
  });

  it("prepends new todo to state on success", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.addTodo("New todo");
    });

    expect(result.current.todos[0]).toEqual(newTodo);
    expect(result.current.todos[1]).toEqual(existingTodo);
  });

  it("sets justAdded=true after success then resets after 4s", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("New todo");
    });

    expect(result.current.justAdded).toBe(true);
    expect(result.current.placeholderContext).toBe("justAdded");

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.justAdded).toBe(false);
  });

  it("sets createError on failure", async () => {
    mockCreateTodo.mockRejectedValue({ error: "VALIDATION_ERROR", message: "Text too long" });
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("Some todo");
    });

    expect(result.current.createError).toBe("Text too long");
    expect(result.current.isCreating).toBe(false);
  });

  it("does not modify todos list on failure", async () => {
    mockCreateTodo.mockRejectedValue({ error: "INTERNAL_ERROR", message: "Server error" });
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.addTodo("Some todo");
    });

    expect(result.current.todos).toEqual([existingTodo]);
  });

  it("falls back to default error message when error has no message", async () => {
    mockCreateTodo.mockRejectedValue({});
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("Some todo");
    });

    expect(result.current.createError).toBe("Failed to create todo");
  });

  it("falls back to default error message when error is null (non-object throw)", async () => {
    mockCreateTodo.mockRejectedValue(null);
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("Some todo");
    });

    expect(result.current.createError).toBe("Failed to create todo");
  });

  it("clears a running justAdded timer when a second todo is added", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("First todo");
    });

    expect(result.current.justAdded).toBe(true);

    await act(async () => {
      await result.current.addTodo("Second todo");
    });

    expect(result.current.justAdded).toBe(true);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.justAdded).toBe(false);
  });

  it("ignores addTodo when a create is already in flight", async () => {
    let resolveCreate!: (value: Todo) => void;
    mockCreateTodo.mockReturnValue(
      new Promise<Todo>((resolve) => {
        resolveCreate = resolve;
      })
    );

    const { result } = renderHook(() => useTodos([]));

    act(() => {
      result.current.addTodo("First");
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      await result.current.addTodo("Second while creating");
    });

    expect(mockCreateTodo).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate(newTodo);
    });
  });

  // toggleTodo tests
  it("exposes toggleTodo function", () => {
    const { result } = renderHook(() => useTodos([existingTodo]));
    expect(typeof result.current.toggleTodo).toBe("function");
  });

  it("sets pendingAction to toggling during toggle API call", async () => {
    let resolveToggle!: (value: Todo) => void;
    mockToggleTodo.mockReturnValue(
      new Promise<Todo>((resolve) => {
        resolveToggle = resolve;
      })
    );

    const { result } = renderHook(() => useTodos([existingTodo]));

    act(() => {
      result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].pendingAction).toBe("toggling");

    await act(async () => {
      resolveToggle(completedTodo);
    });
  });

  it("updates todo completed and completedAt on successful toggle", async () => {
    mockToggleTodo.mockResolvedValue(completedTodo);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.todos[0].completedAt).not.toBeNull();
    expect(result.current.todos[0].pendingAction).toBeUndefined();
  });

  it("calls apiToggleTodo with correct arguments (toggling active → true)", async () => {
    mockToggleTodo.mockResolvedValue(completedTodo);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(mockToggleTodo).toHaveBeenCalledWith(existingTodo.id, true);
  });

  it("calls apiToggleTodo with false when toggling a completed todo", async () => {
    mockToggleTodo.mockResolvedValue(existingTodo);
    const { result } = renderHook(() => useTodos([completedTodo]));

    await act(async () => {
      await result.current.toggleTodo(completedTodo.id);
    });

    expect(mockToggleTodo).toHaveBeenCalledWith(completedTodo.id, false);
  });

  it("clears pendingAction and sets error on toggle failure", async () => {
    mockToggleTodo.mockRejectedValue({ error: "INTERNAL_ERROR", message: "Network failure" });
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].pendingAction).toBeUndefined();
    expect(result.current.todos[0].error).toBe("Network failure");
  });

  it("falls back to default error message on toggle failure with no message", async () => {
    mockToggleTodo.mockRejectedValue({});
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Failed to update todo");
  });

  it("falls back to default error message on toggle failure with null thrown", async () => {
    mockToggleTodo.mockRejectedValue(null);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Failed to update todo");
  });

  it("ignores toggleTodo when item already has a pendingAction", async () => {
    mockToggleTodo.mockResolvedValue(completedTodo);
    const { result } = renderHook(() => useTodos([existingTodo]));

    // Start first toggle without awaiting
    act(() => {
      result.current.toggleTodo(existingTodo.id);
    });

    // Try to toggle again while pending
    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(mockToggleTodo).toHaveBeenCalledTimes(1);

    // Let the first toggle complete
    await act(async () => {});
  });

  it("ignores toggleTodo when todo id does not exist", async () => {
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo("non-existent-id");
    });

    expect(mockToggleTodo).not.toHaveBeenCalled();
  });

  it("does not affect other todos in state when toggling one (covers non-matching branch in map)", async () => {
    const anotherTodo: Todo = {
      id: "another-1",
      text: "Another todo",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    mockToggleTodo.mockResolvedValue(completedTodo);
    const { result } = renderHook(() => useTodos([existingTodo, anotherTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.todos[1].id).toBe("another-1");
    expect(result.current.todos[1].completed).toBe(false);
    expect(result.current.todos[1].pendingAction).toBeUndefined();
  });

  it("preserves other todos when toggle fails (covers non-matching branch in error map)", async () => {
    const anotherTodo: Todo = {
      id: "another-2",
      text: "Other todo",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    mockToggleTodo.mockRejectedValue({ error: "INTERNAL_ERROR", message: "Oops" });
    const { result } = renderHook(() => useTodos([existingTodo, anotherTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Oops");
    expect(result.current.todos[1].error).toBeUndefined();
  });
});
