import CharacterBuilderLayoutClient from "@/features/character-builder/components/CharacterBuilderLayoutClient";

export default function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CharacterBuilderLayoutClient>{children}</CharacterBuilderLayoutClient>;
}
