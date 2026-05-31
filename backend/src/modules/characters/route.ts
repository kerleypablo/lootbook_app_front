import type { FastifyInstance } from "fastify";
import {
  createCharacterController,
  deleteCharacterController,
  getCharacterController,
  listCharactersController,
  updateCharacterController,
} from "./controller.js";

export function registerCharacterRoutes(app: FastifyInstance) {
  app.post("/", createCharacterController);
  app.get("/", listCharactersController);
  app.get("/:id", getCharacterController);
  app.patch("/:id", updateCharacterController);
  app.delete("/:id", deleteCharacterController);
}
