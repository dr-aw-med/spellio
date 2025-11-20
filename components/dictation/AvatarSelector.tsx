'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const defaultAvatars: Avatar[] = [
  { id: '1', name: 'Garçon 1', emoji: '👦', color: '#3b82f6' },
  { id: '2', name: 'Fille 1', emoji: '👧', color: '#ec4899' },
  { id: '3', name: 'Garçon 2', emoji: '🧑', color: '#10b981' },
  { id: '4', name: 'Fille 2', emoji: '👩', color: '#f59e0b' },
  { id: '5', name: 'Garçon 3', emoji: '🧒', color: '#8b5cf6' },
  { id: '6', name: 'Fille 3', emoji: '👶', color: '#ef4444' },
];

export interface AvatarSelectorProps {
  avatars?: Avatar[];
  selectedAvatarId?: string;
  onSelect: (avatar: Avatar) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatars = defaultAvatars,
  selectedAvatarId,
  onSelect,
  className,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-4', className)}>
      {avatars.map((avatar) => {
        const isSelected = selectedAvatarId === avatar.id;
        return (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar)}
            className={cn(
              'rounded-full flex items-center justify-center transition-all duration-200',
              'hover:scale-110 hover:shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              sizeStyles[size],
              isSelected
                ? 'ring-4 ring-primary-500 shadow-lg scale-110'
                : 'ring-2 ring-gray-200 hover:ring-primary-300'
            )}
            style={{
              backgroundColor: isSelected ? avatar.color : `${avatar.color}20`,
            }}
            aria-label={avatar.name}
            aria-pressed={isSelected}
          >
            <span>{avatar.emoji}</span>
          </button>
        );
      })}
    </div>
  );
};

export interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size = 'md',
  showName = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeStyles[size]
        )}
        style={{ backgroundColor: `${avatar.color}20` }}
      >
        <span>{avatar.emoji}</span>
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700">{avatar.name}</span>
      )}
    </div>
  );
};

export default AvatarSelector;

