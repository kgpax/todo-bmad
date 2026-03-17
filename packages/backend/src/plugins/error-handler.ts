import { FastifyInstance, FastifyError } from "fastify";
import fp from "fastify-plugin";
import { INTERNAL_ERROR, VALIDATION_ERROR } from "@todo-bmad/shared";

export const errorHandlerPlugin = fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      request.log.error(error);
    }

    reply.status(statusCode).send({
      error: statusCode === 400 ? VALIDATION_ERROR : INTERNAL_ERROR,
      message:
        statusCode >= 500 ? "An unexpected error occurred" : error.message,
    });
  });
});
