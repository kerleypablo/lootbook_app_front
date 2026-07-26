import type { FastifyInstance } from "fastify";
import {
  createCharacterController,
  deleteCharacterController,
  getCharacterController,
  listCharactersController,
  updateCharacterController,
} from "./controller.js";
import { characterSchemas } from "./schema.js";

export async function registerCharacterRoutes(app: FastifyInstance) {
  app.post("/", {
    preHandler: app.authenticate,
    schema: characterSchemas.create,
    handler: createCharacterController,
  });
  app.get("/", {
    preHandler: app.authenticate,
    schema: characterSchemas.list,
    handler: listCharactersController,
  });
  app.get("/:id", {
    preHandler: app.authenticate,
    schema: characterSchemas.get,
    handler: getCharacterController,
  });
  app.patch("/:id", {
    preHandler: app.authenticate,
    schema: characterSchemas.update,
    handler: updateCharacterController,
  });
  app.delete("/:id", {
    preHandler: app.authenticate,
    schema: characterSchemas.delete,
    handler: deleteCharacterController,
  });
}
