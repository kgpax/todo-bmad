import Fastify from "fastify";
import { AppConfig } from "./config";
import { corsPlugin } from "./plugins/cors";
import { errorHandlerPlugin } from "./plugins/error-handler";

export function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    requestIdHeader: "x-request-id",
    bodyLimit: 10240,
  });

  app.register(corsPlugin, { origin: config.CORS_ORIGIN });
  app.register(errorHandlerPlugin);

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  return app;
}
