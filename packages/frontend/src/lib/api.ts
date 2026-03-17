import type { Todo } from "@todo-bmad/shared";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch(`${API_URL}/api/todos`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.todos;
  } catch {
    return [];
  }
}
