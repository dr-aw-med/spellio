'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DictationInterface } from '@/components/dictation/DictationInterface';
import { ResultsScreen } from '@/components/dictation/ResultsScreen';
import type { Dictation } from '@/types/dictation';
import type { WordComparison, ScoringResult } from '@/types/speech';

export default function DictationPage() {
  const params = useParams();
  const router = useRouter();
  const dictationId = params.id as string;

  const [dictation, setDictation] = useState<Dictation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [finalResult, setFinalResult] = useState<ScoringResult | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Charger la dictée depuis l'API
    const fetchDictation = async () => {
      try {
        const response = await fetch(`/api/dictations/${dictationId}`);
        if (!response.ok) {
          throw new Error('Dictée non trouvée');
        }
        const data = await response.json();
        setDictation(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la dictée:', error);
        // Rediriger vers le tableau de bord en cas d'erreur
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (dictationId) {
      fetchDictation();
    }
  }, [dictationId, router]);

  useEffect(() => {
    // Suivre la durée de la session
    let interval: NodeJS.Timeout;
    if (sessionStartTime && !showResults) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStartTime, showResults]);

  const handleStart = () => {
    setSessionStartTime(Date.now());
    setSessionDuration(0);
  };

  const handleComplete = async (result: ScoringResult) => {
    setFinalResult(result);
    setShowResults(true);

    // Sauvegarder la tentative dans la base de données
    try {
      await fetch('/api/dictations/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dictationId,
          score: result.score,
          accuracy: result.accuracy,
          wordsCorrect: result.score, // À ajuster selon la structure réelle
          wordsTotal: result.maxScore,
          errors: result.errors,
          duration: sessionDuration,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tentative:', error);
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setFinalResult(null);
    setSessionStartTime(null);
    setSessionDuration(0);
  };

  const handleNext = () => {
    // Naviguer vers la prochaine dictée disponible
    router.push('/dashboard');
  };

  const handleQuit = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la dictée...</p>
        </div>
      </div>
    );
  }

  if (!dictation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Dictée non trouvée</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (showResults && finalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <ResultsScreen
          result={finalResult}
          errors={finalResult.errors.map((error) => ({
            word: error.actual,
            expected: error.expected,
            position: error.position,
            type: error.type === 'spelling' ? 'spelling' : 'grammar',
          }))}
          onRetry={handleRetry}
          onNext={handleNext}
          onQuit={handleQuit}
          totalWords={dictation.wordCount || 0}
          correctWords={Math.round((finalResult.accuracy / 100) * (dictation.wordCount || 0))}
          duration={sessionDuration}
        />
      </div>
    );
  }

  return (
    <DictationInterface
      dictation={dictation}
      onComplete={handleComplete}
      onQuit={handleQuit}
    />
  );
}

