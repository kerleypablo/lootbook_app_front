import type { CharacterOption } from '../types';

export const RACES: CharacterOption[] = [
  { id: 'human', name: 'Human', description: 'All ability scores +1', image: '/images/classImages/human.png' },
  { id: 'dwarf', name: 'Dwarf', description: 'Constitution +2', image: '/images/classImages/dwarf.png' },
  { id: 'elf', name: 'Elf', description: 'Dexterity +2', image: '/images/classImages/elf.png' },
  { id: 'dragonborn', name: 'Dragonborn', description: 'Strength +2, Charisma +1', image: '/images/classImages/dragonborn.png' },
  { id: 'tiefling', name: 'Tiefling', description: 'Charisma +2', image: '/images/classImages/tiefling.png' },
  { id: 'half-orc', name: 'Half-Orc', description: 'Strength +2, Constitution +1', image: '/images/classImages/half-orc.png' },
  { id: 'half-elf', name: 'Half-Elf', description: 'Charisma +2, two abilities +1', image: '/images/classImages/half-elf.png' },
  { id: 'halfling', name: 'Halfling', description: 'Dexterity +2', image: '/images/classImages/halfling.png' },
];
