import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { Child, DictationResult } from '../types';
import { getChildren, getChildStats, getChildResults, deleteChild } from '../services/childService';

interface ParentDashboardProps {
  onBack: () => void;
  onSelectChild: (child: Child) => void;
}

interface ChildWithStats extends Child {
  averageScore: number;
  totalDictations: number;
  lastDate: string | null;
}

export const ParentDashboard = ({ onBack, onSelectChild }: ParentDashboardProps) => {
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [childResults, setChildResults] = useState<Record<string, DictationResult[]>>({});
  const [loadingResults, setLoadingResults] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);

  useEffect(() => {
    loadChildrenWithStats();
  }, []);

  const loadChildrenWithStats = async () => {
    setIsLoading(true);
    try {
      const list = await getChildren();
      const withStats = await Promise.all(
        list.map(async (child) => {
          const stats = await getChildStats(child.id);
          return { ...child, ...stats };
        })
      );
      setChildren(withStats);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = async (childId: string) => {
    if (expandedChild === childId) {
      setExpandedChild(null);
      return;
    }

    setExpandedChild(childId);

    // Charger les résultats si pas déjà fait
    if (!childResults[childId]) {
      setLoadingResults(childId);
      try {
        const results = await getChildResults(childId);
        setChildResults(prev => ({ ...prev, [childId]: results }));
      } catch (err) {
        console.error('Erreur chargement résultats:', err);
      } finally {
        setLoadingResults(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteChild(deleteTarget.id);
      setDeleteTarget(null);
      setExpandedChild(null);
      await loadChildrenWithStats();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-indigo-900">📊 Progression</h2>
        <Button variant="secondary" onClick={onBack}>
          ← Retour
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-500">Aucun enfant pour l'instant.</p>
          <p className="text-slate-400 text-sm mt-1">Ajoute un enfant depuis l'écran principal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => {
            const isExpanded = expandedChild === child.id;
            const results = childResults[child.id] || [];
            const isLoadingThis = loadingResults === child.id;

            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300"
              >
                {/* En-tête cliquable */}
                <button
                  onClick={() => handleExpand(child.id)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-4xl">{child.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800 truncate">{child.first_name}</h3>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {child.school_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {child.totalDictations > 0 ? (
                        <>
                          <span className={`font-bold ${scoreColor(child.averageScore)}`}>
                            {child.averageScore}% de moyenne
                          </span>
                          <span>{child.totalDictations} dictée{child.totalDictations > 1 ? 's' : ''}</span>
                          {child.lastDate && (
                            <span className="hidden sm:inline">Dernière : {formatDate(child.lastDate)}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Aucune dictée encore</span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Contenu dépliable */}
                {isExpanded && (
                  <div className="border-t border-slate-100 animate-fade-in">
                    {isLoadingThis ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-200 border-t-indigo-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Chargement...</p>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-400 italic">Pas encore de résultats</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                        {results.map((result) => (
                          <div
                            key={result.id}
                            className={`flex items-center justify-between p-3 rounded-2xl ${scoreBg(result.score)}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">
                                {result.dictation_title || 'Dictée'}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatDate(result.completed_at)} · {result.mode === 'story' ? 'Histoire' : 'Mot à mot'} · {result.total_words} mots
                              </p>
                            </div>
                            <div className={`text-lg font-extrabold ${scoreColor(result.score)} ml-3 shrink-0`}>
                              {result.score}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => onSelectChild(child)}
                        className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                      >
                        Lancer une dictée →
                      </button>
                      <button
                        onClick={() => setDeleteTarget(child)}
                        className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
                      >
                        Supprimer le profil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Supprimer ${deleteTarget?.first_name} ?`}
        message="Le profil et tous ses résultats seront supprimés. Cette action est irréversible."
        variant="warning"
      />
    </div>
  );
};
