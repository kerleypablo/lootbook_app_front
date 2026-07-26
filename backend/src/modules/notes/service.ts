import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { NoteRepository } from "./repository.js";
import type {
  CharacterNoteInput,
  CharacterNoteSummary,
} from "./types.js";

export class NoteService {
  constructor(private readonly repository: NoteRepository) {}

  async replace(
    userId: string,
    characterId: string,
    notes: CharacterNoteInput[],
    logger: FastifyBaseLogger,
  ): Promise<CharacterNoteSummary[]> {
    this.ensureUniqueSections(notes, characterId, logger);

    try {
      const savedNotes = await this.repository.replaceOwned(
        userId,
        characterId,
        notes,
      );

      if (!savedNotes) {
        logger.warn(
          { userId, characterId },
          "Character was not found or is not owned by user during note update",
        );
        throw new AppError(
          404,
          "Character not found",
          { characterId },
          "CharacterNotFoundError",
        );
      }

      return savedNotes;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        { err: error, userId, characterId, noteCount: notes.length },
        "Failed to replace character notes",
      );
      throw error;
    }
  }

  private ensureUniqueSections(
    notes: CharacterNoteInput[],
    characterId: string,
    logger: FastifyBaseLogger,
  ) {
    const sections = new Set<string>();
    const duplicatedSections = new Set<string>();

    for (const note of notes) {
      if (sections.has(note.section)) {
        duplicatedSections.add(note.section);
      }
      sections.add(note.section);
    }

    if (duplicatedSections.size > 0) {
      const duplicated = [...duplicatedSections];
      logger.warn(
        { characterId, duplicatedSections: duplicated },
        "Duplicate note sections received",
      );
      throw new AppError(
        400,
        "Note sections must be unique for a character",
        { duplicatedSections: duplicated },
        "DuplicateNoteSectionError",
      );
    }
  }
}
