import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTodoSchema, updateTodoSchema, VALIDATION_ERROR, NOT_FOUND } from "@todo-bmad/shared";
import { todos } from "../db/schema";

// Lowercase-only: randomUUID() always emits lowercase hex; uppercase IDs can never exist in this DB.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

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

    const text = parsed.text; // Zod schema already calls .trim() and enforces min(1)/max(128)

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    app.db.insert(todos).values({ id, text, completed: false, createdAt }).run();

    return reply.status(201).send({
      todo: { id, text, completed: false, createdAt, completedAt: null },
    });
  });

  app.patch<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
    if (!UUID_REGEX.test(request.params.id)) {
      return reply.status(400).send({ error: VALIDATION_ERROR, message: "Invalid todo id" });
    }

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

    const completedAt = parsed.completed ? new Date().toISOString() : null;
    app.db.update(todos).set({ completed: parsed.completed, completedAt }).where(eq(todos.id, request.params.id)).run();

    return reply.status(200).send({
      todo: { ...existing, completed: parsed.completed, completedAt },
    });
  });

  app.delete<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
    if (!UUID_REGEX.test(request.params.id)) {
      return reply.status(400).send({ error: VALIDATION_ERROR, message: "Invalid todo id" });
    }

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
