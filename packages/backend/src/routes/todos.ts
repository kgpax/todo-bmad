import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTodoSchema, updateTodoSchema, VALIDATION_ERROR, NOT_FOUND } from "@todo-bmad/shared";
import { todos } from "../db/schema";

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export const todosRoutes = fp(async (app: FastifyInstance) => {
  app.get("/api/todos", async (_request, _reply) => {
    const rows = app.db.select().from(todos).orderBy(desc(todos.createdAt)).all();
    return { todos: rows };
  });

  app.post("/api/todos", async (request, reply) => {
    let parsed;
    try {
      parsed = createTodoSchema.parse(request.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          error: VALIDATION_ERROR,
          message: err.issues[0].message,
        });
      }
      throw err;
    }

    const text = stripHtmlTags(parsed.text).trim();
    if (text.length === 0) {
      return reply.status(400).send({
        error: VALIDATION_ERROR,
        message: "Text must not be empty",
      });
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    app.db.insert(todos).values({ id, text, completed: false, createdAt }).run();

    return reply.status(201).send({
      todo: { id, text, completed: false, createdAt },
    });
  });

  app.patch<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
    let parsed;
    try {
      parsed = updateTodoSchema.parse(request.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          error: VALIDATION_ERROR,
          message: err.issues[0].message,
        });
      }
      throw err;
    }

    const existing = app.db.select().from(todos).where(eq(todos.id, request.params.id)).get();
    if (!existing) {
      return reply.status(404).send({
        error: NOT_FOUND,
        message: "Todo not found",
      });
    }

    app.db.update(todos).set({ completed: parsed.completed }).where(eq(todos.id, request.params.id)).run();

    return reply.status(200).send({
      todo: { ...existing, completed: parsed.completed },
    });
  });

  app.delete<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
    const existing = app.db.select().from(todos).where(eq(todos.id, request.params.id)).get();
    if (!existing) {
      return reply.status(404).send({
        error: NOT_FOUND,
        message: "Todo not found",
      });
    }

    app.db.delete(todos).where(eq(todos.id, request.params.id)).run();

    return reply.status(204).send();
  });
});
