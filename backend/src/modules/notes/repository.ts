import type { PrismaClient } from "@prisma/client";
import type {
  CharacterNoteInput,
  CharacterNoteSummary,
} from "./types.js";

const noteSelect = {
  id: true,
  section: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class NoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async replaceOwned(
    userId: string,
    characterId: string,
    notes: CharacterNoteInput[],
  ): Promise<CharacterNoteSummary[] | null> {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({
        where: {
          id: characterId,
          userId,
        },
        select: { id: true },
      });

      if (!character) {
        return null;
      }

      await transaction.characterNote.deleteMany({
        where: { characterId },
      });

      if (notes.length > 0) {
        await transaction.characterNote.createMany({
          data: notes.map((note) => ({
            characterId,
            section: note.section,
            content: note.content,
          })),
        });
      }

      return transaction.characterNote.findMany({
        where: { characterId },
        orderBy: { section: "asc" },
        select: noteSelect,
      });
    });
  }
}
