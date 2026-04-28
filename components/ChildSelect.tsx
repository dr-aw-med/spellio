import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Child } from '../types';
import { getChildren, createChild, touchChild } from '../services/childService';

const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐸', '🐰', '🐻', '🦋', '🐧', '🐲'];
const SCHOOL_LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème'];

const AVATAR_COLORS: Record<string, string> = {
  '🦊': 'from-orange-100 to-amber-50 border-orange-200 hover:border-orange-400',
  '🐱': 'from-amber-100 to-yellow-50 border-amber-200 hover:border-amber-400',
  '🐶': 'from-amber-100 to-orange-50 border-amber-200 hover:border-amber-400',
  '🦁': 'from-yellow-100 to-amber-50 border-yellow-200 hover:border-yellow-400',
  '🐼': 'from-slate-100 to-gray-50 border-slate-200 hover:border-slate-400',
  '🦄': 'from-purple-100 to-pink-50 border-purple-200 hover:border-purple-400',
  '🐸': 'from-emerald-100 to-green-50 border-emerald-200 hover:border-emerald-400',
  '🐰': 'from-pink-100 to-rose-50 border-pink-200 hover:border-pink-400',
  '🐻': 'from-amber-100 to-orange-50 border-amber-200 hover:border-amber-400',
  '🦋': 'from-sky-100 to-blue-50 border-sky-200 hover:border-sky-400',
  '🐧': 'from-sky-100 to-indigo-50 border-sky-200 hover:border-sky-400',
  '🐲': 'from-emerald-100 to-teal-50 border-emerald-200 hover:border-emerald-400',
};

const DEFAULT_CARD_STYLE = 'from-indigo-100 to-violet-50 border-indigo-200 hover:border-indigo-400';

interface ChildSelectProps {
  onSelectChild: (child: Child) => void;
  onViewProgress: () => void;
  parentName: string | null;
}

export const ChildSelect = ({ onSelectChild, onViewProgress, parentName }: ChildSelectProps) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🦊');
  const [newLevel, setNewLevel] = useState('CP');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setIsLoading(true);
    try {
      const list = await getChildren();
      setChildren(list);
    } catch (err) {
      console.error('Erreur chargement enfants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Le prénom est obligatoire');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await createChild(newName.trim(), newAvatar, newLevel);
      setShowForm(false);
      setNewName('');
      setNewAvatar('🦊');
      setNewLevel('CP');
      await loadChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelect = async (child: Child) => {
    await touchChild(child.id);
    onSelectChild(child);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
        <p className="text-slate-400 font-medium">Chargement...</p>
      </div>
    );
  }

  if (children.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in p-6">
        <div className="text-7xl mb-6 animate-float">🎈</div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
          {parentName ? `Bienvenue ${parentName} !` : 'Bienvenue !'}
        </h2>
        <p className="text-slate-500 text-center mb-8 text-lg">
          Ajoute ton premier enfant pour commencer !
        </p>
        <Button onClick={() => setShowForm(true)} className="text-lg px-8 py-4">
          + Ajouter un enfant
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">
          {parentName ? `Bonjour ${parentName} !` : 'Bonjour !'}
        </h2>
        <p className="text-slate-500 mt-1">Qui fait la dictée aujourd'hui ?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {children.map((child, i) => {
          const colors = AVATAR_COLORS[child.avatar] || DEFAULT_CARD_STYLE;
          return (
            <button
              key={child.id}
              onClick={() => handleSelect(child)}
              className={`animate-fade-in-up flex flex-col items-center p-6 bg-gradient-to-br ${colors} rounded-3xl border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{child.avatar}</div>
              <h3 className="text-lg font-bold text-slate-800">{child.first_name}</h3>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 bg-white/70 px-3 py-1 rounded-full">
                {child.school_level}
              </span>
            </button>
          );
        })}
      </div>

      {showForm ? (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-6 animate-scale-in">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">Nouvel enfant</h3>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-sm text-slate-400 hover:text-indigo-500 transition-colors"
            >
              Annuler
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Prénom</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all"
                placeholder="Le prénom de l'enfant"
                maxLength={50}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Choisis un avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewAvatar(emoji)}
                    className={`text-3xl p-2.5 rounded-2xl transition-all duration-200 ${
                      newAvatar === emoji
                        ? 'bg-indigo-100 border-2 border-indigo-400 scale-110 shadow-md'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-indigo-50 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Niveau scolaire</label>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewLevel(level)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      newLevel === level
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-2xl border border-red-100">{error}</p>
            )}

            <Button
              onClick={handleCreate}
              disabled={isSaving}
              isLoading={isSaving}
              className="w-full"
            >
              Ajouter {newAvatar} {newName || 'l\'enfant'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-semibold hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/50 transition-all duration-300 mb-6"
        >
          + Ajouter un enfant
        </button>
      )}

      <div className="text-center">
        <button
          onClick={onViewProgress}
          className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1.5 mx-auto"
        >
          <span>📊</span>
          Voir la progression
        </button>
      </div>
    </div>
  );
};
