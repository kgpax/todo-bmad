import helmet from "@fastify/helmet";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const helmetPlugin = fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
});
