import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Child, DictationResult } from '../types';
import { getChildResults, getChildStats } from '../services/childService';

interface ChildProfileProps {
  child: Child;
  onBack: () => void;
}

export const ChildProfile = ({ child, onBack }: ChildProfileProps) => {
  const [results, setResults] = useState<DictationResult[]>([]);
  const [stats, setStats] = useState<{ averageScore: number; totalDictations: number; lastDate: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [r, s] = await Promise.all([
          getChildResults(child.id),
          getChildStats(child.id),
        ]);
        setResults(r);
        setStats(s);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [child.id]);

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  const scoreEmoji = (score: number) => {
    if (score === 100) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 50) return '👍';
    return '🌱';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
        <p className="text-slate-400 font-medium">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 animate-fade-in">
      {/* Profil */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-3">{child.avatar}</div>
        <h2 className="text-2xl font-bold text-slate-800">{child.first_name}</h2>
        <span className="text-sm font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mt-2 inline-block">
          {child.school_level}
        </span>
      </div>

      {/* Stats résumé */}
      {stats && stats.totalDictations > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-indigo-600">{stats.totalDictations}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Dictées</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className={`text-2xl font-extrabold ${scoreColor(stats.averageScore)}`}>{stats.averageScore}%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Moyenne</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-pink-500">
              {results.filter(r => r.score === 100).length}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">Sans faute</p>
          </div>
        </div>
      )}

      {/* Historique */}
      <h3 className="text-lg font-bold text-slate-700 mb-4">Mes dictées</h3>

      {results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-slate-400 font-medium">Pas encore de dictées !</p>
          <p className="text-slate-300 text-sm mt-1">Fais ta première dictée pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {results.map((result, i) => (
            <div
              key={result.id}
              className={`bg-white rounded-2xl border p-4 animate-fade-in-up ${scoreBg(result.score)}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{scoreEmoji(result.score)}</span>
                    <p className="font-bold text-slate-700 truncate">
                      {result.dictation_title || 'Dictée'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-7">
                    {formatDate(result.completed_at)} · {result.mode === 'story' ? 'Histoire magique' : 'Mot à mot'} · {result.total_words} mots
                    {result.mistakes > 0 && ` · ${result.mistakes} faute${result.mistakes > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className={`text-2xl font-extrabold ${scoreColor(result.score)} ml-3 shrink-0`}>
                  {result.score}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={onBack} className="w-full">
        ← Retour
      </Button>
    </div>
  );
};
