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

function getScoreMessage(score: number, mistakes: number): { emoji: string; title: string; subtitle: string } {
  if (mistakes === 0) return { emoji: '🏆', title: 'Parfait !', subtitle: 'Zéro faute, tu es un champion !' };
  if (score >= 90) return { emoji: '🌟', title: 'Excellent !', subtitle: 'Presque parfait, bravo !' };
  if (score >= 70) return { emoji: '💪', title: 'Bien joué !', subtitle: 'Continue comme ça !' };
  if (score >= 50) return { emoji: '👍', title: 'Pas mal !', subtitle: 'Encore un peu d\'entraînement !' };
  return { emoji: '🌱', title: 'Courage !', subtitle: 'C\'est en s\'entraînant qu\'on progresse !' };
}

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
  const scoreInfo = score !== null ? getScoreMessage(score, mistakes!) : null;

  const handleMistakesSubmit = async () => {
    const n = parseInt(mistakesInput);
    if (isNaN(n) || n < 0 || n > totalWords) return;

    setMistakes(n);

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

  const scoreColor = score !== null
    ? score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-400'
    : '';
  const barColor = score !== null
    ? score >= 80 ? 'from-emerald-400 to-emerald-500' : score >= 50 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500'
    : '';

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
        {/* Trophée ou emoji adapté au score */}
        <div className="text-8xl mb-4 animate-celebrate">
          {scoreInfo?.emoji || '🏆'}
        </div>

        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          {scoreInfo?.title || 'Bravo !'}
        </h1>

        <p className="text-lg text-slate-500 font-medium mb-1">
          {scoreInfo?.subtitle || 'Tu as terminé ta dictée !'}
        </p>

        <p className="text-slate-400 mb-6">
          {totalWords} mots dictés
        </p>

        {/* Auto-évaluation */}
        {mistakes === null ? (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm animate-fade-in">
            <p className="text-sm font-bold text-slate-700 mb-3">Combien de fautes as-tu fait ?</p>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                max={totalWords}
                value={mistakesInput}
                onChange={(e) => setMistakesInput(e.target.value)}
                className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-center text-xl font-bold"
                placeholder="0"
                onKeyDown={(e) => e.key === 'Enter' && handleMistakesSubmit()}
                autoFocus
              />
              <Button onClick={handleMistakesSubmit} disabled={!mistakesInput}>
                OK
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-600">Ton score</span>
              <span className={`text-4xl font-extrabold animate-score-pop ${scoreColor}`}>
                {score}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-3">
              {mistakes === 0 ? 'Zéro faute ! Tu es incroyable !' :
               mistakes === 1 ? '1 seule faute, c\'est presque parfait !' :
               `${mistakes} fautes sur ${totalWords} mots`}
            </p>
            {saved && (
              <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center justify-center gap-1 animate-fade-in">
                Sauvegardé
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
            className="mb-6 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold hover:bg-emerald-100 transition-all duration-200 hover:shadow-sm"
          >
            Voir la correction
          </button>
        ) : (
          <div className="mb-6 w-full bg-emerald-50 rounded-2xl border border-emerald-100 p-5 animate-scale-in">
            <p className="text-sm font-bold text-emerald-700 mb-3">Les mots :</p>
            <div className="flex flex-wrap gap-2">
              {words.map((word, i) => (
                <span key={i} className="bg-white px-3 py-1.5 rounded-xl text-slate-700 font-medium text-sm border border-emerald-100 shadow-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={onRetry}
            className="w-full"
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
