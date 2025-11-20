/**
 * Types pour le système de dictées
 */

export enum SchoolLevel {
  CP = "CP",
  CE1 = "CE1",
  CE2 = "CE2",
  CM1 = "CM1",
  CM2 = "CM2",
}

export enum DictationCategory {
  ORTHOGRAPHY = "orthography",
  GRAMMAR = "grammar",
  VOCABULARY = "vocabulary",
  CONJUGATION = "conjugation",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface Dictation {
  id: string;
  title: string;
  text: string;
  level: SchoolLevel;
  category: DictationCategory;
  difficulty: Difficulty;
  description?: string;
  estimatedDuration?: number; // en minutes
  wordCount?: number;
  isUnlocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DictationAttempt {
  id: string;
  dictationId: string;
  profileId: string;
  score: number;
  accuracy: number;
  wordsCorrect: number;
  wordsTotal: number;
  errors: DictationError[];
  completedAt: Date;
  duration?: number; // en secondes
}

export interface DictationError {
  word: string;
  expected: string;
  position: number;
  type: ErrorType;
}

export enum ErrorType {
  SPELLING = "spelling",
  GRAMMAR = "grammar",
  PUNCTUATION = "punctuation",
  CAPITALIZATION = "capitalization",
}

export interface DictationFilters {
  level?: SchoolLevel;
  category?: DictationCategory;
  difficulty?: Difficulty;
  search?: string;
  unlockedOnly?: boolean;
}

export interface DictationProgress {
  dictationId: string;
  profileId: string;
  isCompleted: boolean;
  bestScore?: number;
  attemptsCount: number;
  lastAttemptAt?: Date;
  isUnlocked: boolean;
}

export interface CreateDictationInput {
  title: string;
  text: string;
  level: SchoolLevel;
  category: DictationCategory;
  difficulty: Difficulty;
  description?: string;
  estimatedDuration?: number;
}

export interface UpdateDictationInput {
  title?: string;
  text?: string;
  level?: SchoolLevel;
  category?: DictationCategory;
  difficulty?: Difficulty;
  description?: string;
  estimatedDuration?: number;
}

