// Types pour les statistiques et tableaux de bord

export interface DictationResult {
  id: string;
  dictationId: string;
  profileId: string;
  score: number;
  accuracy: number;
  completedAt: Date;
  errors: DictationError[];
  timeSpent: number; // en secondes
}

export interface DictationError {
  word: string;
  expected: string;
  actual: string;
  type: 'spelling' | 'grammar' | 'punctuation';
  position: number;
}

export interface ProfileStats {
  profileId: string;
  profileName: string;
  totalDictations: number;
  completedDictations: number;
  averageScore: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  currentLevel: string;
  badges: string[];
  stars: number;
  progressByLevel: LevelProgress[];
  recentDictations: DictationResult[];
  errorAnalysis: ErrorAnalysis;
  progressionOverTime: ProgressionPoint[];
}

export interface LevelProgress {
  level: string;
  total: number;
  completed: number;
  averageScore: number;
  unlocked: boolean;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: {
    spelling: number;
    grammar: number;
    punctuation: number;
  };
  mostCommonErrors: CommonError[];
  improvementAreas: string[];
}

export interface CommonError {
  word: string;
  expected: string;
  count: number;
  type: 'spelling' | 'grammar' | 'punctuation';
}

export interface ProgressionPoint {
  date: Date;
  score: number;
  accuracy: number;
  dictationId: string;
}

export interface DashboardOverview {
  totalDictations: number;
  completedToday: number;
  averageScore: number;
  currentStreak: number;
  nextSuggestedDictation?: {
    id: string;
    title: string;
    level: string;
  };
  recentAchievements: Achievement[];
}

export interface Achievement {
  id: string;
  type: 'badge' | 'star' | 'level' | 'streak';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface ParentDashboard {
  totalProfiles: number;
  profiles: ProfileSummary[];
  overallStats: {
    totalDictations: number;
    totalTimeSpent: number;
    averageScore: number;
  };
}

export interface ProfileSummary {
  profileId: string;
  name: string;
  avatar?: string;
  level: string;
  completedDictations: number;
  averageScore: number;
  lastActivity: Date;
  progress: number; // pourcentage
}

