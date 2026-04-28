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
  illustration?: string | null;
  storyFullText?: string | null;
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

export const FinishScreen = ({ onRetry, onRetryChild, onNew, words, activeChild, dictationCode, dictationTitle, mode, illustration, storyFullText }: FinishScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [errorWords, setErrorWords] = useState<Set<number>>(new Set());
  const [bonusErrors, setBonusErrors] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showStoryText, setShowStoryText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const totalWords = words.length;
  const totalMistakes = errorWords.size + bonusErrors;
  const score = Math.max(0, Math.round(((totalWords - totalMistakes) / totalWords) * 100));
  const scoreInfo = isConfirmed ? getScoreMessage(score, totalMistakes) : null;

  const toggleWordError = (index: number) => {
    if (isConfirmed) return;
    setErrorWords(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleConfirm = async () => {
    setIsConfirmed(true);

    if (activeChild) {
      try {
        await saveResult(
          activeChild.id,
          dictationCode || 'MANUAL',
          dictationTitle || 'Dictée',
          mode || 'word',
          totalWords,
          totalMistakes
        );
        setSaved(true);
      } catch {
        setSaveError(true);
      }
    }
  };

  const handleSaveIllustration = async () => {
    if (!illustration) return;
    try {
      const res = await fetch(illustration);
      const blob = await res.blob();

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'spellio.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'spellio-illustration.png', { type: 'image/png' })],
          title: 'Mon illustration Spellio',
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spellio-${dictationTitle || 'illustration'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Annulé par l'utilisateur
    }
  };

  const scoreColor = isConfirmed
    ? score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-400'
    : '';
  const barColor = isConfirmed
    ? score >= 80 ? 'from-emerald-400 to-emerald-500' : score >= 50 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500'
    : '';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-pink-50 to-amber-50 -z-10 rounded-3xl" />

      {isConfirmed && CONFETTI.map((c, i) => (
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
        className={`flex flex-col items-center text-center px-6 w-full max-w-md transition-all duration-700 ${
          showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
        }`}
      >
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

        {/* Illustration (mode histoire) */}
        {illustration && (
          <div className="w-full mb-6 animate-fade-in">
            <div className="rounded-2xl overflow-hidden shadow-md mb-3">
              <img src={illustration} alt="Illustration de l'histoire" className="w-full h-auto" />
            </div>
            <button
              onClick={handleSaveIllustration}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <span>📸</span>
              Enregistrer l'illustration
            </button>
          </div>
        )}

        {/* Sélection des mots avec erreurs */}
        {!isConfirmed ? (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm animate-fade-in">
            <p className="text-sm font-bold text-slate-700 mb-1">Touche les mots où tu as fait une faute :</p>
            <p className="text-xs text-slate-400 mb-4">
              {errorWords.size === 0 ? 'Aucun mot sélectionné' : `${errorWords.size} mot${errorWords.size > 1 ? 's' : ''} sélectionné${errorWords.size > 1 ? 's' : ''}`}
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {words.map((word, i) => {
                const isError = errorWords.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleWordError(i)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 active:scale-95 ${
                      isError
                        ? 'bg-red-50 border-red-300 text-red-600 line-through'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Fautes bonus (grammaire, conjugaison...) */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 mb-5">
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-600">Autres fautes</p>
                <p className="text-xs text-slate-400">Grammaire, conjugaison...</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBonusErrors(prev => Math.max(0, prev - 1))}
                  disabled={bonusErrors === 0}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:border-indigo-300 disabled:opacity-30 transition-all"
                >
                  -
                </button>
                <span className="text-lg font-bold text-slate-700 w-6 text-center">{bonusErrors}</span>
                <button
                  onClick={() => setBonusErrors(prev => prev + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:border-indigo-300 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full">
              {totalMistakes === 0 ? 'Zéro faute !' : `Valider (${totalMistakes} faute${totalMistakes > 1 ? 's' : ''})`}
            </Button>
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

            {/* Mots avec erreurs marquées */}
            <div className="flex flex-wrap gap-2 mt-4">
              {words.map((word, i) => {
                const isError = errorWords.has(i);
                return (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                      isError
                        ? 'bg-red-50 border-red-200 text-red-500 line-through'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            <p className="text-sm text-slate-400 mt-3">
              {totalMistakes === 0 ? 'Zéro faute ! Tu es incroyable !' :
               `${totalMistakes} faute${totalMistakes > 1 ? 's' : ''} sur ${totalWords} mots`}
              {bonusErrors > 0 && ` (dont ${bonusErrors} de grammaire)`}
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

        {/* Texte complet de la dictée (mode histoire) */}
        {isConfirmed && storyFullText && (
          <>
            {!showStoryText ? (
              <button
                onClick={() => setShowStoryText(true)}
                className="mb-6 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-100 transition-all duration-200 hover:shadow-sm"
              >
                Voir le texte de la dictée
              </button>
            ) : (
              <div className="mb-6 w-full bg-white rounded-2xl border border-indigo-100 p-5 animate-scale-in text-left">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-bold text-indigo-600">Le texte complet :</p>
                  <button
                    onClick={() => setShowStoryText(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Masquer
                  </button>
                </div>
                <p className="text-slate-700 leading-relaxed text-[15px]">{storyFullText}</p>
              </div>
            )}
          </>
        )}

        {isConfirmed && (
          <div className="flex flex-col gap-3 w-full animate-fade-in">
            <Button onClick={onRetry} className="w-full">
              Recommencer
            </Button>
            {activeChild && onRetryChild && (
              <Button variant="secondary" onClick={onRetryChild} className="w-full">
                Encore une dictée pour {activeChild.first_name}
              </Button>
            )}
            <Button variant="secondary" onClick={onNew} className="w-full">
              Nouvelle dictée
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
