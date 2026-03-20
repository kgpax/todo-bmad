import type { Todo, ApiError } from "@todo-bmad/shared";

const API_URL = process.env.API_URL || "http://localhost:3001";
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FetchTodosResult {
  todos: Todo[];
  fetchFailed: boolean;
}

export async function fetchTodos(): Promise<FetchTodosResult> {
  try {
    const response = await fetch(`${API_URL}/api/todos`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { todos: [], fetchFailed: true };
    }
    const data = await response.json();
    return {
      todos: Array.isArray(data?.todos) ? data.todos : [],
      fetchFailed: false,
    };
  } catch {
    return { todos: [], fetchFailed: true };
  }
}

export async function fetchTodosClient(): Promise<Todo[]> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos`, { cache: "no-store" });
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to load todos",
    }));
    throw errorData;
  }
  const data = await response.json();
  return Array.isArray(data?.todos) ? data.todos : [];
}

export async function createTodo(text: string): Promise<Todo> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to create todo",
    }));
    throw errorData;
  }

  const data = await response.json();
  return data.todo;
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to update todo",
    }));
    throw errorData;
  }

  const data = await response.json();
  return data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to delete todo",
    }));
    throw errorData;
  }
}
