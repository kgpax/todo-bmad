import { fetchTodos } from "@/lib/api";
import { TodoPage } from "@/components/todo-page";
import { EMPTY_STATE_MESSAGES } from "@/components/empty-state";
import { pickRandom } from "@/lib/utils";

export const revalidate = false;

export default async function Home() {
  const todos = await fetchTodos();
  const emptyMessage = pickRandom(EMPTY_STATE_MESSAGES);
  return (
    <main className="min-h-screen px-4 md:px-6">
      <div className="max-w-[640px] mx-auto">
        <TodoPage initialTodos={todos} emptyMessage={emptyMessage} />
      </div>
    </main>
  );
}
