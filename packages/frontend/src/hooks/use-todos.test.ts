import { renderHook, act } from "@testing-library/react";
import { useTodos } from "./use-todos";
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

  it("addTodo clears loadError on success when initialFetchFailed=true", async () => {
    mockCreateTodo.mockResolvedValue(newTodo);
    const { result } = renderHook(() => useTodos([], true));
    expect(result.current.loadError).toBe(true);

    await act(async () => {
      await result.current.addTodo("New todo");
    });

    expect(result.current.loadError).toBe(false);
    expect(result.current.todos).toHaveLength(1);
  });

  it("addTodo does NOT clear loadError on failure when initialFetchFailed=true", async () => {
    mockCreateTodo.mockRejectedValue({ message: "Still down" });
    const { result } = renderHook(() => useTodos([], true));
    expect(result.current.loadError).toBe(true);

    await act(async () => {
      await result.current.addTodo("New todo");
    });

    expect(result.current.loadError).toBe(true);
    expect(result.current.createError).toBe("Still down");
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

  it("does not affect other todos in state when toggling one", async () => {
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

  it("preserves other todos when toggle fails", async () => {
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

  // deleteTodo tests
  it("exposes deleteTodo function", () => {
    const { result } = renderHook(() => useTodos([existingTodo]));
    expect(typeof result.current.deleteTodo).toBe("function");
  });

  it("sets pendingAction to deleting during delete API call", async () => {
    let resolveDelete!: () => void;
    mockDeleteTodo.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      })
    );

    const { result } = renderHook(() => useTodos([existingTodo]));

    act(() => {
      result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].pendingAction).toBe("deleting");

    await act(async () => {
      resolveDelete();
    });
  });

  it("removes the todo from state on successful delete", async () => {
    mockDeleteTodo.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it("calls apiDeleteTodo with the correct id", async () => {
    mockDeleteTodo.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(mockDeleteTodo).toHaveBeenCalledWith(existingTodo.id);
  });

  it("clears pendingAction and sets error on delete failure", async () => {
    mockDeleteTodo.mockRejectedValue({ error: "INTERNAL_ERROR", message: "Network failure" });
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].pendingAction).toBeUndefined();
    expect(result.current.todos[0].error).toBe("Network failure");
  });

  it("falls back to default error message on delete failure with no message", async () => {
    mockDeleteTodo.mockRejectedValue({});
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Failed to delete todo");
  });

  it("falls back to default error message on delete failure with null thrown", async () => {
    mockDeleteTodo.mockRejectedValue(null);
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Failed to delete todo");
  });

  it("ignores deleteTodo when item already has a pendingAction", async () => {
    mockDeleteTodo.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTodos([existingTodo]));

    act(() => {
      result.current.deleteTodo(existingTodo.id);
    });

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(mockDeleteTodo).toHaveBeenCalledTimes(1);

    await act(async () => {});
  });

  it("ignores deleteTodo when todo id does not exist", async () => {
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo("non-existent-id");
    });

    expect(mockDeleteTodo).not.toHaveBeenCalled();
  });

  it("does not affect other todos in state when deleting one", async () => {
    const anotherTodo: Todo = {
      id: "another-3",
      text: "Another todo",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    mockDeleteTodo.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTodos([existingTodo, anotherTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe("another-3");
    expect(result.current.todos[0].error).toBeUndefined();
    expect(result.current.todos[0].pendingAction).toBeUndefined();
  });

  it("preserves other todos when delete fails", async () => {
    const anotherTodo: Todo = {
      id: "another-4",
      text: "Another todo",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    mockDeleteTodo.mockRejectedValue({ error: "INTERNAL_ERROR", message: "Oops" });
    const { result } = renderHook(() => useTodos([existingTodo, anotherTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBe("Oops");
    expect(result.current.todos[1].error).toBeUndefined();
  });

  // loadError / isLoading / retryLoad tests
  it("initializes loadError=false by default", () => {
    const { result } = renderHook(() => useTodos([]));
    expect(result.current.loadError).toBe(false);
  });

  it("initializes loadError=true when initialFetchFailed=true", () => {
    const { result } = renderHook(() => useTodos([], true));
    expect(result.current.loadError).toBe(true);
  });

  it("initializes isLoading=false", () => {
    const { result } = renderHook(() => useTodos([]));
    expect(result.current.isLoading).toBe(false);
  });

  it("retryLoad: sets isLoading=true and clears loadError before fetch completes", async () => {
    let resolveClient!: (value: typeof existingTodo[]) => void;
    mockFetchTodosClient.mockReturnValue(
      new Promise<typeof existingTodo[]>((resolve) => {
        resolveClient = resolve;
      })
    );

    const { result } = renderHook(() => useTodos([], true));
    expect(result.current.loadError).toBe(true);

    act(() => {
      result.current.retryLoad();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadError).toBe(false);

    await act(async () => {
      resolveClient([]);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("retryLoad: sets todos and clears isLoading on success", async () => {
    mockFetchTodosClient.mockResolvedValue([existingTodo]);
    const { result } = renderHook(() => useTodos([], true));

    await act(async () => {
      await result.current.retryLoad();
    });

    expect(result.current.todos).toEqual([existingTodo]);
    expect(result.current.loadError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("retryLoad: calls revalidateHome on success", async () => {
    const { revalidateHome } = jest.requireMock("@/lib/actions");
    mockFetchTodosClient.mockResolvedValue([]);
    const { result } = renderHook(() => useTodos([], true));

    await act(async () => {
      await result.current.retryLoad();
    });

    expect(revalidateHome).toHaveBeenCalled();
  });

  it("retryLoad: sets loadError=true and clears isLoading on failure", async () => {
    mockFetchTodosClient.mockRejectedValue({ error: "INTERNAL_ERROR" });
    const { result } = renderHook(() => useTodos([], false));

    await act(async () => {
      await result.current.retryLoad();
    });

    expect(result.current.loadError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  // clearCreateError tests
  it("exposes clearCreateError function", () => {
    const { result } = renderHook(() => useTodos([]));
    expect(typeof result.current.clearCreateError).toBe("function");
  });

  it("clearCreateError sets createError to null", async () => {
    mockCreateTodo.mockRejectedValue({ message: "Server error" });
    const { result } = renderHook(() => useTodos([]));

    await act(async () => {
      await result.current.addTodo("Some todo");
    });

    expect(result.current.createError).toBe("Server error");

    act(() => {
      result.current.clearCreateError();
    });

    expect(result.current.createError).toBeNull();
  });

  // errorType tests
  it("sets errorType to 'toggle' on toggle failure", async () => {
    mockToggleTodo.mockRejectedValue({ message: "Network failure" });
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].errorType).toBe("toggle");
  });

  it("sets errorType to 'delete' on delete failure", async () => {
    mockDeleteTodo.mockRejectedValue({ message: "Network failure" });
    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].errorType).toBe("delete");
  });

  it("clears error and errorType on successful toggle retry", async () => {
    mockToggleTodo.mockRejectedValueOnce({ message: "Network failure" });
    const completedVersion: Todo = {
      ...existingTodo,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    mockToggleTodo.mockResolvedValueOnce(completedVersion);

    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBeDefined();
    expect(result.current.todos[0].errorType).toBe("toggle");

    await act(async () => {
      await result.current.toggleTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBeUndefined();
    expect(result.current.todos[0].errorType).toBeUndefined();
  });

  it("clears error and errorType on successful delete retry", async () => {
    mockDeleteTodo.mockRejectedValueOnce({ message: "Network failure" });
    mockDeleteTodo.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTodos([existingTodo]));

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos[0].error).toBeDefined();
    expect(result.current.todos[0].errorType).toBe("delete");

    await act(async () => {
      await result.current.deleteTodo(existingTodo.id);
    });

    expect(result.current.todos).toHaveLength(0);
  });
});
