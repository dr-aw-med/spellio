import { useEffect, useState } from 'react';
import { Button } from './Button';

interface FinishScreenProps {
  onRetry: () => void;
  onNew: () => void;
}

const CONFETTI = [
  { emoji: '🎉', left: '10%', delay: '0s', duration: '2.5s' },
  { emoji: '🌟', left: '25%', delay: '0.3s', duration: '2.8s' },
  { emoji: '✨', left: '40%', delay: '0.1s', duration: '2.2s' },
  { emoji: '🎊', left: '55%', delay: '0.5s', duration: '2.6s' },
  { emoji: '⭐', left: '70%', delay: '0.2s', duration: '2.4s' },
  { emoji: '🌈', left: '85%', delay: '0.4s', duration: '2.7s' },
  { emoji: '🎉', left: '15%', delay: '0.6s', duration: '3.0s' },
  { emoji: '✨', left: '50%', delay: '0.7s', duration: '2.3s' },
  { emoji: '🌟', left: '80%', delay: '0.15s', duration: '2.9s' },
  { emoji: '🎊', left: '35%', delay: '0.45s', duration: '2.1s' },
];

export const FinishScreen = ({ onRetry, onNew }: FinishScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      {/* Fond dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-pink-50 to-amber-50 -z-10 rounded-3xl" />

      {/* Confetti animés */}
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="absolute top-0 text-3xl pointer-events-none"
          style={{
            left: c.left,
            animation: `confetti-fall ${c.duration} ease-in ${c.delay} forwards`,
          }}
        >
          {c.emoji}
        </span>
      ))}

      {/* Contenu principal */}
      <div
        className={`flex flex-col items-center text-center px-6 transition-all duration-700 ${
          showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
        }`}
      >
        {/* Gros emoji avec pulsation */}
        <div className="text-8xl mb-6 animate-bounce">🏆</div>

        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-4">
          Bravo !
        </h1>

        <p className="text-xl text-slate-600 font-medium mb-2">
          Tu as terminé ta dictée !
        </p>

        <p className="text-slate-400 mb-10">
          Continue comme ça, tu es un champion ! 💪
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button
            onClick={onRetry}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
          >
            🔄 Recommencer
          </Button>
          <Button
            variant="secondary"
            onClick={onNew}
            className="flex-1"
          >
            📝 Nouvelle dictée
          </Button>
        </div>
      </div>
    </div>
  );
};
