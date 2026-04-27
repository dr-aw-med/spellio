import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { AudioPlayButton } from './AudioPlayButton';
import { SpeedControl } from './SpeedControl';
import { ProgressBar } from './ProgressBar';
import { generateStoryFromWords, generateStoryIllustration } from '../services/api';
import { speak, prefetchAudio } from '../services/ttsService';
import { StoryResponse } from '../types';

interface StoryDictationProps {
  words: string[];
  onFinish: () => void;
  onBack: () => void;
}

export const StoryDictation = ({ words, onFinish, onBack }: StoryDictationProps) => {
  const [storyData, setStoryData] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [dictationDone, setDictationDone] = useState(false);

  const [mode, setMode] = useState<'PREVIEW' | 'DICTATION'>('PREVIEW');
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const stopAudioRef = useRef<() => void>(() => {});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const init = async () => {
      try {
        const result = await generateStoryFromWords(words);
        if (!isMountedRef.current) return;
        setStoryData(result);
        const rawSentences = result.story.match(/[^.!?]+[.!?]+(\s|$)/g) || [result.story];
        const parsed = rawSentences.map(s => s.trim());
        setSentences(parsed);
        // Prefetch les premieres phrases pour la dictee
        parsed.slice(0, 2).forEach(s => {
          prefetchAudio(`${s}. . . . Je répète : ${s}`);
        });
        // Générer l'illustration automatiquement
        generateStoryIllustration(result.story).then(img => {
          if (isMountedRef.current && img) {
            setGeneratedImage(`data:image/png;base64,${img}`);
          }
        }).catch(() => {});
      } catch {
        if (isMountedRef.current) setError(true);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    init();
    return () => {
      isMountedRef.current = false;
      stopAudioRef.current();
    };
  }, [words]);

  // Prefetch la phrase suivante quand on change de phrase
  useEffect(() => {
    if (mode === 'DICTATION' && currentSentenceIndex < sentences.length - 1) {
      const next = sentences[currentSentenceIndex + 1];
      prefetchAudio(`${next}. . . . Je répète : ${next}`);
    }
  }, [currentSentenceIndex, mode, sentences]);

  const handleStop = () => {
    stopAudioRef.current();
    if (isMountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const playText = async (text: string, isDictation = false) => {
    handleStop();
    const textToRead = isDictation ? `${text}. . . . Je répète : ${text}` : text;
    setIsLoading(true);

    const stop = await speak(textToRead, {
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

  const togglePlay = (text: string, isDictation = false) => {
    if (isPlaying) handleStop();
    else playText(text, isDictation);
  };

  const handleGenerateIllustration = async () => {
    if (!storyData) return;
    setIsGeneratingImage(true);
    try {
      const imageBase64 = await generateStoryIllustration(storyData.story);
      if (isMountedRef.current && imageBase64) {
        setGeneratedImage(`data:image/png;base64,${imageBase64}`);
      }
    } catch {
      // Illustration optionnelle
    } finally {
      if (isMountedRef.current) setIsGeneratingImage(false);
    }
  };

  const handleNextSentence = () => {
    handleStop();
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-6" />
        <h3 className="text-xl font-bold text-indigo-900 mb-2">Création de l'histoire...</h3>
        <p className="text-slate-400">La magie est en cours</p>
      </div>
    );
  }

  // Error
  if (error || !storyData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Oups !</h3>
        <p className="text-slate-500 mb-6">Je n'ai pas réussi à créer l'histoire.</p>
        <Button onClick={onBack}>Retour au menu</Button>
      </div>
    );
  }

  // DICTATION MODE
  if (mode === 'DICTATION') {
    const currentSentence = sentences[currentSentenceIndex];

    return (
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-md mx-auto p-4">
        <ProgressBar current={currentSentenceIndex + 1} total={sentences.length} label="Phrase" />
        <SpeedControl value={playbackRate} onChange={setPlaybackRate} />

        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <AudioPlayButton
            isPlaying={isPlaying}
            onClick={() => togglePlay(currentSentence, true)}
            disabled={isLoading}
          >
            <svg className="w-20 h-20 text-indigo-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </AudioPlayButton>

          <p className="text-slate-400 font-medium text-center">
            {isLoading ? "Chargement..." : isPlaying ? "Pause" : "Écouter la phrase"}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            onClick={() => { handleStop(); setCurrentSentenceIndex(prev => Math.max(0, prev - 1)); }}
            disabled={currentSentenceIndex === 0}
          >
            Précédent
          </Button>
          <Button onClick={handleNextSentence}>
            {currentSentenceIndex === sentences.length - 1 ? 'Terminer' : 'Phrase Suivante'}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => { handleStop(); setMode('PREVIEW'); }}
            className="text-sm text-slate-400 underline hover:text-red-500"
          >
            Arrêter la dictée
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW MODE
  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 h-full">
      <div className="flex-1 overflow-y-auto mb-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4 text-center">{storyData.title}</h2>

        {generatedImage ? (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-md animate-fade-in">
            <img src={generatedImage} alt="Illustration" className="w-full h-auto object-cover" />
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 via-pink-50 to-amber-50 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">📖✨</div>
              <p className="text-indigo-400 text-sm font-medium">
                {dictationDone ? 'Bravo, dictée terminée !' : 'Écoute bien l\'histoire...'}
              </p>
            </div>
          </div>
        )}

        {!dictationDone && (
          <p className="italic text-slate-400 text-center text-sm mb-4 bg-slate-50 p-3 rounded-xl">
            Découvre l'histoire complète avant de commencer la dictée !
          </p>
        )}

        {isPlaying && (
          <div className="flex justify-center items-center h-12 gap-1 mb-4">
            {[0, 0.2, 0.1].map((delay, i) => (
              <span key={i} className="w-1.5 bg-indigo-400 rounded-full animate-audio-wave h-full" style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => { handleStop(); setMode('DICTATION'); setCurrentSentenceIndex(0); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
        >
          Lancer la dictée (phrase par phrase)
        </Button>

        {!isPlaying ? (
          <Button
            variant="secondary"
            onClick={() => togglePlay(`Voici l'histoire : ${storyData.title}. . . ${storyData.story}`)}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Écouter tout
          </Button>
        ) : (
          <Button variant="danger" onClick={handleStop}>Pause</Button>
        )}

        <Button variant="secondary" onClick={() => { handleStop(); onBack(); }} disabled={isPlaying}>
          Retour au menu
        </Button>
      </div>

      {dictationDone && (
        <details className="mt-6 group">
          <summary className="list-none text-center text-green-500 text-sm font-medium cursor-pointer hover:text-green-600 transition-colors select-none">
            Voir la correction
          </summary>
          <div className="mt-4 p-6 bg-green-50 rounded-2xl border border-green-100 text-slate-700 animate-fade-in select-text">
            {storyData.story}
          </div>
        </details>
      )}
    </div>
  );
};
