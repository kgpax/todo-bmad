import { fetchTodos } from "@/lib/api";
import { TodoPage } from "@/components/todo-page";

export const revalidate = false;

export default async function Home() {
  const todos = await fetchTodos();
  return (
    <main className="min-h-screen px-4 md:px-6">
      <div className="max-w-[640px] mx-auto">
        <TodoPage initialTodos={todos} />
      </div>
    </main>
  );
}
