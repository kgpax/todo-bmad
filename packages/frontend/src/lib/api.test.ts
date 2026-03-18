import { fetchTodos, createTodo } from "./api";
import type { Todo } from "@todo-bmad/shared";

const mockTodo: Todo = {
  id: "abc-123",
  text: "Test todo",
  completed: false,
  createdAt: new Date().toISOString(),
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("fetchTodos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns todos array on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ todos: [mockTodo] }),
    });
    const result = await fetchTodos();
    expect(result).toEqual([mockTodo]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/todos"),
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("returns empty array when response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    expect(await fetchTodos()).toEqual([]);
  });

  it("returns empty array when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    expect(await fetchTodos()).toEqual([]);
  });

  it("returns empty array when todos field is not an array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ todos: null }),
    });
    expect(await fetchTodos()).toEqual([]);
  });
});

describe("createTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the new todo on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ todo: mockTodo }),
    });
    const result = await createTodo("Test todo");
    expect(result).toEqual(mockTodo);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/todos"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Test todo" }),
      })
    );
  });

  it("throws the parsed ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "VALIDATION_ERROR", message: "Text required" }),
    });
    await expect(createTodo("")).rejects.toEqual({
      error: "VALIDATION_ERROR",
      message: "Text required",
    });
  });

  it("throws a fallback ApiError when the error response body is not valid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("bad json");
      },
    });
    await expect(createTodo("test")).rejects.toEqual({
      error: "INTERNAL_ERROR",
      message: "Failed to create todo",
    });
  });
});
