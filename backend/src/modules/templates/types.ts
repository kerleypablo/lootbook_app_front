import type { Prisma } from "@prisma/client";

export const DEFAULT_TEMPLATE_KEY = "ficha-livre";

export type TemplateSummary = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  systemFamily: string | null;
  isOfficial: boolean;
  configJson: Prisma.JsonValue | null;
};
