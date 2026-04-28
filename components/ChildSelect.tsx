import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Child } from '../types';
import { getChildren, createChild, touchChild } from '../services/childService';

const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐸', '🐰', '🐻', '🦋', '🐧', '🐲'];
const SCHOOL_LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème'];

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
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  // Onboarding : aucun enfant
  if (children.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in p-6">
        <div className="text-7xl mb-6 animate-bounce">🎈</div>
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
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          {parentName ? `Bonjour ${parentName} !` : 'Bonjour !'}
        </h2>
        <p className="text-slate-500 mt-1">Qui fait la dictée aujourd'hui ?</p>
      </div>

      {/* Grille des enfants */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => handleSelect(child)}
            className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-md border-2 border-transparent hover:border-pink-400 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-6xl mb-3 group-hover:animate-bounce">{child.avatar}</div>
            <h3 className="text-lg font-bold text-indigo-900">{child.first_name}</h3>
            <span className="text-xs font-medium text-slate-400 mt-1 bg-slate-50 px-2 py-0.5 rounded-full">
              {child.school_level}
            </span>
          </button>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      {showForm ? (
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">Nouvel enfant</h3>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-sm text-slate-400 hover:text-indigo-500"
            >
              Annuler
            </button>
          </div>

          <div className="space-y-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Le prénom de l'enfant"
                maxLength={50}
                autoFocus
              />
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Choisis un avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewAvatar(emoji)}
                    className={`text-3xl p-2 rounded-2xl transition-all duration-200 ${
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

            {/* Niveau scolaire */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Niveau scolaire</label>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewLevel(level)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      newLevel === level
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-xl">{error}</p>
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
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-semibold hover:border-pink-400 hover:text-pink-500 transition-all duration-300 mb-6"
        >
          + Ajouter un enfant
        </button>
      )}

      {/* Lien progression */}
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
