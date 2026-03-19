import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const corsPlugin = fp(
  async (app: FastifyInstance, config: { origin: string }) => {
    await app.register(cors, {
      origin: [config.origin],
      methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    });
  }
);
