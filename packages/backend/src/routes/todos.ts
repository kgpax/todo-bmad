import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { desc } from "drizzle-orm";
import { todos } from "../db/schema";

export const todosRoutes = fp(async (app: FastifyInstance) => {
  app.get("/api/todos", async (_request, _reply) => {
    const rows = app.db.select().from(todos).orderBy(desc(todos.createdAt)).all();
    return { todos: rows };
  });
});
