export interface StenoKeyDef {
  index: number;
  label: string;
  gridColumn: string;
  gridRow: string;
  isNumBar?: boolean;
  isVowel?: boolean;
  finger?: string;
}

export type KeyMap = Record<string, number>; // e.g. "KeyQ": 1

export interface KeyMapPreset {
  id: string;
  name: string;
  description: string;
  mapping: KeyMap;
}

export interface TapeEntry {
  id: string;
  rawChord: string;
  formattedChord: string;
  translation: string;
  columns: string;
  timestamp: number;
}

export interface PracticeItem {
  id: string;
  targetChord: string;
  displayWord: string;
  category: string;
  hintLabel?: string;
  sentenceWords?: { word: string; chord: string }[];
}

export type QuizCategory =
  | 'sentence'
  | 'abbr'
  | 'derivatives'
  | 'phrasing'
  | 'days'
  | 'months'
  | 'provinces'
  | 'all';
