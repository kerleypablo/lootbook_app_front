import type { FastifyInstance } from "fastify";

export type ModuleRouteRegistrar = (app: FastifyInstance) => void;
