export enum AppStep {
  LOGIN = 'LOGIN',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  CHILD_SELECT = 'CHILD_SELECT',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  UPLOAD = 'UPLOAD',
  VERIFY = 'VERIFY',
  CHOOSE_MODE = 'CHOOSE_MODE',
  DICTATION_WORD = 'DICTATION_WORD',
  DICTATION_STORY = 'DICTATION_STORY',
  FINISHED = 'FINISHED',
}

export interface WordListResponse {
  words: string[];
}

export interface StoryResponse {
  title: string;
  story: string;
}

export interface Dictation {
  id: string;
  code: string;
  title: string;
  words: string[];
  user_id?: string;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  first_name: string;
  avatar: string;
  school_level: string;
  pin?: string;
  created_at: string;
  updated_at: string;
}

export interface DictationResult {
  id: string;
  child_id: string;
  dictation_code: string;
  dictation_title: string;
  mode: 'word' | 'story';
  total_words: number;
  mistakes: number;
  score: number;
  completed_at: string;
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | null;
