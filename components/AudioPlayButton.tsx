import type { ReactNode } from 'react';

interface AudioPlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

export const AudioPlayButton = ({ isPlaying, onClick, disabled = false, children }: AudioPlayButtonProps) => {
  return (
    <div className="relative group">
      <div className={`absolute -inset-6 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full blur-2xl transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-110 animate-pulse' : 'opacity-0 scale-90'}`} />
      <div className={`absolute -inset-1 bg-white rounded-full blur opacity-20 transition-all duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`} />

      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-4
          ${isPlaying ? 'bg-indigo-600 border-pink-400 scale-105' : 'bg-white border-white hover:scale-105 active:scale-95'}`}
      >
        {disabled ? (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
        ) : isPlaying ? (
          <div className="flex gap-1.5 items-center justify-center h-20 w-24">
            {[0.1, 0.3, 0.0, 0.4, 0.2].map((delay, i) => (
              <span
                key={i}
                className="w-2.5 bg-white rounded-full animate-audio-wave"
                style={{ animationDelay: `${delay}s`, animationDuration: `${[0.8, 1.2, 1.0, 0.7, 1.1][i]}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center transform transition-transform group-hover:scale-110">
            {children}
          </div>
        )}
      </button>
    </div>
  );
};
