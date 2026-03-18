import { renderHook, act } from "@testing-library/react";
import { useTodos } from "./use-todos";
import type { Todo } from "@todo-bmad/shared";

jest.mock("@/lib/api", () => ({
  createTodo: jest.fn(),
}));

jest.mock("@/lib/actions", () => ({
  revalidateHome: jest.fn().mockResolvedValue(undefined),
}));

import { createTodo } from "@/lib/api";

const mockCreateTodo = createTodo as jest.MockedFunction<typeof createTodo>;

const existingTodo: Todo = {
  id: "existing-1",
  text: "Existing todo",
  completed: false,
  createdAt: new Date().toISOString(),
};

const newTodo: Todo = {
  id: "new-1",
  text: "New todo",
  completed: false,
  createdAt: new Date().toISOString(),
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
});
