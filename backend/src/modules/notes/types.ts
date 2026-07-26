export type CharacterNoteInput = {
  section: string;
  content: string;
};

export type ReplaceNotesInput = {
  notes: CharacterNoteInput[];
};

export type CharacterNoteSummary = {
  id: string;
  section: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = {
  id: string;
};
