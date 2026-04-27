export enum AppStep {
  LOGIN = 'LOGIN',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  UPLOAD = 'UPLOAD',
  VERIFY = 'VERIFY',
  CHOOSE_MODE = 'CHOOSE_MODE',
  DICTATION_WORD = 'DICTATION_WORD',
  DICTATION_STORY = 'DICTATION_STORY',
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

export type UserRole = 'STUDENT' | 'TEACHER' | null;
