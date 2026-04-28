import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { AudioPlayButton } from './AudioPlayButton';
import { SpeedControl } from './SpeedControl';
import { ProgressBar } from './ProgressBar';
import { speak, prefetchAudio } from '../services/ttsService';

interface WordDictationProps {
  words: string[];
  onFinish: () => void;
  onBack: () => void;
}

const ENCOURAGEMENTS = [
  'Continue comme ça !',
  'Super !',
  'Tu assures !',
  'Bravo, on continue !',
  'Encore un effort !',
  'Tu es en forme !',
];

export const WordDictation = ({ words, onFinish, onBack }: WordDictationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const stopAudioRef = useRef<() => void>(() => {});
  const isMountedRef = useRef(true);

  const currentWord = words[currentIndex];
  const progress = Math.round(((currentIndex + 1) / words.length) * 100);

  useEffect(() => {
    isMountedRef.current = true;
    words.slice(0, 3).forEach(w => prefetchAudio(`${w}. . . Encore une fois : ${w}`));
    return () => {
      isMountedRef.current = false;
      stopAudioRef.current();
    };
  }, []);

  useEffect(() => {
    setIsRevealed(false);
    setHasListened(false);

    if (currentIndex < words.length - 1) {
      const next = words[currentIndex + 1];
      prefetchAudio(`${next}. . . Encore une fois : ${next}`);
    }

    const timer = setTimeout(() => {
      if (isMountedRef.current) playWord(words[currentIndex]);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleStop = () => {
    stopAudioRef.current();
    if (isMountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const playWord = async (text: string) => {
    handleStop();
    const prompt = `${text}. . . Encore une fois : ${text}`;
    setIsLoading(true);

    const stop = await speak(prompt, {
      rate: playbackRate,
      onEnd: () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setIsLoading(false);
          setHasListened(true);
        }
      }
    });

    if (isMountedRef.current) {
      stopAudioRef.current = stop;
      setIsPlaying(true);
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) handleStop();
    else playWord(currentWord);
  };

  const handleNext = () => {
    handleStop();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    handleStop();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const encouragement = ENCOURAGEMENTS[currentIndex % ENCOURAGEMENTS.length];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-md mx-auto p-4">
      <ProgressBar current={currentIndex + 1} total={words.length} label="Mot" />

      <SpeedControl value={playbackRate} onChange={setPlaybackRate} />

      {/* Encouragement contextuel */}
      {currentIndex > 0 && currentIndex % 3 === 0 && (
        <div className="text-center mb-2 animate-fade-in">
          <span className="text-sm font-semibold text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full">
            {encouragement}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <AudioPlayButton isPlaying={isPlaying} onClick={togglePlay} disabled={isLoading}>
          {isRevealed ? (
            <span className="text-indigo-900 font-bold text-lg animate-fade-in">{currentWord}</span>
          ) : hasListened ? (
            <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
            <span className="text-indigo-300 font-bold text-5xl">?</span>
          )}
        </AudioPlayButton>

        <div className="flex flex-col items-center gap-1">
          <p className="text-slate-400 font-medium animate-fade-in">
            {isLoading ? "Chargement..." : isPlaying ? "J'écoute..." : hasListened ? "Réécouter" : "Appuie pour écouter"}
          </p>
          {/* Mini dots progression */}
          <div className="flex gap-1.5 mt-3">
            {words.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 h-2.5 bg-gradient-to-r from-indigo-500 to-pink-500'
                    : i < currentIndex
                    ? 'w-2.5 h-2.5 bg-indigo-300'
                    : 'w-2.5 h-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4">
        <Button variant="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
          Précédent
        </Button>
        {currentIndex === words.length - 1 ? (
          <Button variant="success" onClick={onFinish}>Terminer</Button>
        ) : (
          <Button onClick={handleNext}>Mot Suivant</Button>
        )}
      </div>

      <div className="mt-4 text-center">
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">
          Retour au choix
        </button>
      </div>
    </div>
  );
};
