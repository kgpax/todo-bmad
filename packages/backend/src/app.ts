import Fastify from "fastify";
import { AppConfig } from "./config";
import { getDb } from "./db/client";
import { corsPlugin } from "./plugins/cors";
import { errorHandlerPlugin } from "./plugins/error-handler";
import { healthRoutes } from "./routes/health";
import { todosRoutes } from "./routes/todos";

type DbInstance = ReturnType<typeof getDb>;

declare module "fastify" {
  interface FastifyInstance {
    db: DbInstance;
  }
}

export function buildApp(config: AppConfig, db: DbInstance) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    requestIdHeader: "x-request-id",
    bodyLimit: 10240,
  });

  app.decorate("db", db);

  app.register(corsPlugin, { origin: config.CORS_ORIGIN });
  app.register(errorHandlerPlugin);
  app.register(healthRoutes);
  app.register(todosRoutes);

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  return app;
}
