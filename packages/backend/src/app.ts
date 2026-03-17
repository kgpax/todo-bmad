import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({ logger: true });

  // Routes and plugins will be registered here in future stories

  return app;
}
