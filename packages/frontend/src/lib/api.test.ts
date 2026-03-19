import { fetchTodos, createTodo, toggleTodo, deleteTodo } from "./api";

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchTodos", () => {
  it("returns todos array on success", async () => {
    const todos = [
      { id: "1", text: "Test", completed: false, createdAt: "2026-01-01T00:00:00.000Z", completedAt: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ todos }),
    });

    const result = await fetchTodos();
    expect(result).toEqual(todos);
  });

  it("returns [] when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const result = await fetchTodos();
    expect(result).toEqual([]);
  });

  it("returns [] when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchTodos();
    expect(result).toEqual([]);
  });

  it("returns [] when data.todos is not an array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ todos: "not-an-array" }),
    });

    const result = await fetchTodos();
    expect(result).toEqual([]);
  });

  it("returns [] when data itself is null (data?.todos null branch)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const result = await fetchTodos();
    expect(result).toEqual([]);
  });
});

describe("createTodo", () => {
  it("returns the new todo on success", async () => {
    const newTodo = {
      id: "1",
      text: "Test",
      completed: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      completedAt: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ todo: newTodo }),
    });

    const result = await createTodo("Test");
    expect(result).toEqual(newTodo);
  });

  it("throws parsed ApiError when response is not ok with valid JSON error body", async () => {
    const apiError = { error: "VALIDATION_ERROR", message: "Text too long" };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(apiError),
    });

    await expect(createTodo("Test")).rejects.toEqual(apiError);
  });

  it("throws fallback ApiError when response is not ok with invalid JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    await expect(createTodo("Test")).rejects.toEqual({
      error: "INTERNAL_ERROR",
      message: "Failed to create todo",
    });
  });
});

describe("toggleTodo", () => {
  const updatedTodo = {
    id: "1",
    text: "Test",
    completed: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-03-19T10:00:00.000Z",
  };

  it("returns updated todo on success (completing)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ todo: updatedTodo }),
    });

    const result = await toggleTodo("1", true);
    expect(result).toEqual(updatedTodo);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/todos/1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ completed: true }),
      })
    );
  });

  it("returns updated todo on success (uncompleting)", async () => {
    const uncompleted = { ...updatedTodo, completed: false, completedAt: null };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ todo: uncompleted }),
    });

    const result = await toggleTodo("1", false);
    expect(result).toEqual(uncompleted);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/todos/1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ completed: false }),
      })
    );
  });

  it("throws parsed ApiError when response is not ok with valid JSON error body", async () => {
    const apiError = { error: "NOT_FOUND", message: "Todo not found" };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(apiError),
    });

    await expect(toggleTodo("999", true)).rejects.toEqual(apiError);
  });

  it("throws fallback ApiError when response is not ok with invalid JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    await expect(toggleTodo("1", true)).rejects.toEqual({
      error: "INTERNAL_ERROR",
      message: "Failed to update todo",
    });
  });
});

describe("deleteTodo", () => {
  it("resolves void on 204 success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await expect(deleteTodo("1")).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/todos/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws parsed ApiError when response is not ok with valid JSON error body", async () => {
    const apiError = { error: "NOT_FOUND", message: "Todo not found" };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(apiError),
    });

    await expect(deleteTodo("999")).rejects.toEqual(apiError);
  });

  it("throws fallback ApiError when response is not ok with invalid JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    await expect(deleteTodo("1")).rejects.toEqual({
      error: "INTERNAL_ERROR",
      message: "Failed to delete todo",
    });
  });
});
