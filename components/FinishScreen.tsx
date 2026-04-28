import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Child } from '../types';
import { saveResult } from '../services/childService';

interface FinishScreenProps {
  onRetry: () => void;
  onRetryChild?: () => void;
  onNew: () => void;
  words: string[];
  activeChild: Child | null;
  dictationCode?: string;
  dictationTitle?: string;
  mode?: 'word' | 'story';
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

export const FinishScreen = ({ onRetry, onRetryChild, onNew, words, activeChild, dictationCode, dictationTitle, mode }: FinishScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [mistakes, setMistakes] = useState<number | null>(null);
  const [mistakesInput, setMistakesInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const totalWords = words.length;
  const score = mistakes !== null ? Math.round(((totalWords - mistakes) / totalWords) * 100) : null;

  const handleMistakesSubmit = async () => {
    const n = parseInt(mistakesInput);
    if (isNaN(n) || n < 0 || n > totalWords) return;

    setMistakes(n);

    // Sauvegarde automatique si enfant actif
    if (activeChild) {
      try {
        await saveResult(
          activeChild.id,
          dictationCode || 'MANUAL',
          dictationTitle || 'Dictée',
          mode || 'word',
          totalWords,
          n
        );
        setSaved(true);
      } catch {
        setSaveError(true);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-pink-50 to-amber-50 -z-10 rounded-3xl" />

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

      <div
        className={`flex flex-col items-center text-center px-6 w-full max-w-sm transition-all duration-700 ${
          showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
        }`}
      >
        <div className="text-8xl mb-6 animate-bounce">🏆</div>

        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-4">
          Bravo !
        </h1>

        <p className="text-xl text-slate-600 font-medium mb-2">
          Tu as terminé ta dictée !
        </p>

        <p className="text-slate-400 mb-6">
          {totalWords} mots dictés 💪
        </p>

        {/* Auto-évaluation */}
        {mistakes === null ? (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 mb-6 animate-fade-in">
            <p className="text-sm font-bold text-slate-700 mb-3">Combien de fautes as-tu fait ?</p>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={totalWords}
                value={mistakesInput}
                onChange={(e) => setMistakesInput(e.target.value)}
                className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center text-lg font-bold"
                placeholder="0"
                onKeyDown={(e) => e.key === 'Enter' && handleMistakesSubmit()}
              />
              <Button onClick={handleMistakesSubmit} disabled={!mistakesInput}>
                OK
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">Ton score :</span>
              <span className={`text-3xl font-extrabold ${
                score! >= 80 ? 'text-green-500' : score! >= 50 ? 'text-amber-500' : 'text-red-400'
              }`}>
                {score}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  score! >= 80 ? 'bg-green-500' : score! >= 50 ? 'bg-amber-500' : 'bg-red-400'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {mistakes === 0 ? 'Zéro faute ! Parfait ! 🌟' :
               mistakes === 1 ? '1 seule faute, c\'est presque parfait !' :
               `${mistakes} fautes sur ${totalWords} mots`}
            </p>
            {saved && (
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center justify-center gap-1 animate-fade-in">
                Sauvegardé ✓
              </p>
            )}
            {saveError && (
              <p className="text-xs text-red-400 font-medium mt-2 text-center animate-fade-in">
                Erreur de sauvegarde
              </p>
            )}
          </div>
        )}

        {/* Correction */}
        {!showCorrection ? (
          <button
            onClick={() => setShowCorrection(true)}
            className="mb-6 px-6 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-600 font-semibold hover:bg-green-100 transition-colors"
          >
            Voir la correction
          </button>
        ) : (
          <div className="mb-6 w-full bg-green-50 rounded-2xl border border-green-100 p-5 animate-fade-in">
            <p className="text-sm font-bold text-green-700 mb-3">Les mots :</p>
            <div className="flex flex-wrap gap-2">
              {words.map((word, i) => (
                <span key={i} className="bg-white px-3 py-1 rounded-lg text-slate-700 font-medium text-sm border border-green-100">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={onRetry}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
          >
            Recommencer
          </Button>
          {activeChild && onRetryChild && (
            <Button
              variant="secondary"
              onClick={onRetryChild}
              className="w-full"
            >
              Encore une dictée pour {activeChild.first_name}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onNew}
            className="w-full"
          >
            Nouvelle dictée
          </Button>
        </div>
      </div>
    </div>
  );
};
