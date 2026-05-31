export type CharacterLinkInput = {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  operation: string;
  config?: unknown;
};
