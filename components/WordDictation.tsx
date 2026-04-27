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

export const WordDictation = ({ words, onFinish, onBack }: WordDictationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const stopAudioRef = useRef<() => void>(() => {});
  const isMountedRef = useRef(true);

  const currentWord = words[currentIndex];

  useEffect(() => {
    isMountedRef.current = true;
    // Prefetch les premiers mots
    words.slice(0, 3).forEach(w => prefetchAudio(`${w}. . . Encore une fois : ${w}`));
    return () => {
      isMountedRef.current = false;
      stopAudioRef.current();
    };
  }, []);

  useEffect(() => {
    setIsRevealed(false);

    // Prefetch le mot suivant
    if (currentIndex < words.length - 1) {
      const next = words[currentIndex + 1];
      prefetchAudio(`${next}. . . Encore une fois : ${next}`);
    }

    // Auto-play apres un court delai
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-md mx-auto p-4">
      <ProgressBar current={currentIndex + 1} total={words.length} label="Mot" />

      <SpeedControl value={playbackRate} onChange={setPlaybackRate} />

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <AudioPlayButton isPlaying={isPlaying} onClick={togglePlay} disabled={isLoading}>
          {isRevealed ? (
            <span className="text-indigo-900 font-bold text-lg animate-fade-in">{currentWord}</span>
          ) : (
            <span className="text-indigo-300 font-bold text-5xl">?</span>
          )}
        </AudioPlayButton>

        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 font-medium animate-fade-in">
            {isLoading ? "Chargement..." : isPlaying ? "J'écoute..." : "Appuie pour écouter"}
          </p>

          {!isRevealed && !isPlaying && !isLoading && (
            <button
              onClick={() => setIsRevealed(true)}
              className="text-xs text-indigo-400 hover:text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 transition-colors"
            >
              Indice
            </button>
          )}
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
        <button onClick={onBack} className="text-sm text-slate-400 underline hover:text-indigo-500 transition-colors">
          Retour au choix
        </button>
      </div>
    </div>
  );
};
