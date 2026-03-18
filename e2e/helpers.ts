import { APIRequestContext } from "@playwright/test";

const API_URL = "http://localhost:3001";

export async function deleteAllTodos(request: APIRequestContext) {
  const response = await request.get(`${API_URL}/api/todos`);
  if (response.ok()) {
    const data = await response.json();
    for (const todo of data.todos ?? []) {
      await request.delete(`${API_URL}/api/todos/${todo.id}`);
    }
  }
}

export async function seedTodos(request: APIRequestContext, texts: string[]) {
  for (const text of texts) {
    await request.post(`${API_URL}/api/todos`, { data: { text } });
  }
}
