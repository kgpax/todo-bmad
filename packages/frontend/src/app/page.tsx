import { fetchTodos } from "@/lib/api";
import { TodoPage } from "@/components/todo-page";
import { EMPTY_STATE_MESSAGES } from "@/components/empty-state";

export const revalidate = false;

export default async function Home() {
  const todos = await fetchTodos();
  const emptyMessage =
    EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)];
  return (
    <main className="min-h-screen px-4 md:px-6">
      <div className="max-w-[640px] mx-auto">
        <TodoPage initialTodos={todos} emptyMessage={emptyMessage} />
      </div>
    </main>
  );
}
