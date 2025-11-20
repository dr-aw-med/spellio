/**
 * Export centralisé des composants de dictée
 */

export { default as DictationCard } from './DictationCard';
export type { DictationCardProps } from './DictationCard';

export { default as WordDisplay, WordListDisplay } from './WordDisplay';
export type { WordDisplayProps, WordListDisplayProps, WordStatus } from './WordDisplay';

export { default as ScoreDisplay } from './ScoreDisplay';
export type { ScoreDisplayProps } from './ScoreDisplay';

export { default as LevelIndicator, LevelProgress } from './LevelIndicator';
export type { LevelIndicatorProps, LevelProgressProps, SchoolLevel } from './LevelIndicator';

export { default as AvatarSelector, AvatarDisplay, defaultAvatars } from './AvatarSelector';
export type { AvatarSelectorProps, AvatarDisplayProps, Avatar } from './AvatarSelector';

