import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const rateLimitPlugin = fp(
  async (app: FastifyInstance, config: { max: number }) => {
    await app.register(rateLimit, {
      max: config.max,
      timeWindow: "1 minute",
    });
  }
);
