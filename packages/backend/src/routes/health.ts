import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { sql } from "drizzle-orm";

export const healthRoutes = fp(async (app: FastifyInstance) => {
  app.get("/api/health", async (_request, reply) => {
    app.db.get(sql`SELECT 1`);
    return reply.status(200).send({ status: "ok", db: "ok" });
  });
});
