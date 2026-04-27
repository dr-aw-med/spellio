import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Dictation } from '../types';
import { saveDictation, getAllDictations, deleteDictation } from '../services/storageService';
import { extractWordsFromImage, extractWordsFromText } from '../services/api';
import { compressImage } from '../utils/imageUtils';
import { Modal } from './Modal';

type CreateStep = 'INPUT' | 'REVIEW';

export const TeacherDashboard = () => {
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>('INPUT');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWordsInput, setNewWordsInput] = useState('');
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDictations();
  }, []);

  const loadDictations = async () => {
    setIsLoading(true);
    try {
      const list = await getAllDictations();
      setDictations(list);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setCreateStep('INPUT');
    setNewTitle('');
    setNewWordsInput('');
    setExtractedWords([]);
    setError('');
  };

  // Analyse du texte saisi par Gemini
  const handleAnalyzeText = async () => {
    if (!newWordsInput.trim()) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const words = await extractWordsFromText(newWordsInput);
      setExtractedWords(words);
      setCreateStep('REVIEW');
    } catch {
      setError('Erreur lors de l\'analyse du texte');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyse d'une photo par OCR Gemini
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const { base64, mimeType } = await compressImage(file);
      const words = await extractWordsFromImage(base64, mimeType);
      setExtractedWords(words);
      setCreateStep('REVIEW');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse de la photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Modification d'un mot dans la liste de review
  const handleWordChange = (index: number, value: string) => {
    const updated = [...extractedWords];
    updated[index] = value;
    setExtractedWords(updated);
  };

  const handleRemoveWord = (index: number) => {
    setExtractedWords(extractedWords.filter((_, i) => i !== index));
  };

  const handleAddWord = () => {
    setExtractedWords([...extractedWords, '']);
  };

  // Sauvegarde finale
  const handleSave = async () => {
    const words = extractedWords.filter(w => w.trim() !== '');
    if (words.length === 0) return;

    setIsSaving(true);
    try {
      await saveDictation(newTitle, words);
      resetForm();
      await loadDictations();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteDictation(deleteTarget);
    if (success) await loadDictations();
    setDeleteTarget(null);
  };

  // ETAPE REVIEW : verification des mots extraits
  if (isCreating && createStep === 'REVIEW') {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-fade-in">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Vérifier les mots</h3>
            <button
              onClick={() => setCreateStep('INPUT')}
              className="text-sm text-slate-400 hover:text-indigo-500"
            >
              ← Modifier la saisie
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre (optionnel)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ex: Dictée n°12 - Les animaux"
            />
          </div>

          <p className="text-sm text-slate-500 mb-3">{extractedWords.length} mots détectés — tu peux modifier, ajouter ou supprimer :</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {extractedWords.map((word, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none font-medium"
                />
                <button
                  onClick={() => handleRemoveWord(index)}
                  className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddWord}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors mb-6"
          >
            + Ajouter un mot
          </button>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={resetForm} disabled={isSaving}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSaving || extractedWords.length === 0} isLoading={isSaving}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ETAPE INPUT : saisie ou photo
  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-fade-in">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 mb-8">
          <h3 className="text-lg font-bold mb-6">Créer une dictée</h3>

          {/* Option 1 : Photo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Prendre en photo la liste de mots</label>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-4 border-dashed rounded-2xl cursor-pointer transition-all
              ${isAnalyzing ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2" />
                  <p className="text-indigo-600 font-medium text-sm">Analyse en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-slate-500 font-medium">Touche pour prendre une photo</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                disabled={isAnalyzing}
              />
            </label>
          </div>

          <div className="relative w-full flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full absolute" />
            <span className="bg-white px-3 text-slate-400 font-medium relative z-10 text-sm">OU</span>
          </div>

          {/* Option 2 : Saisie texte */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Saisir les mots ou une phrase</label>
            <textarea
              value={newWordsInput}
              onChange={(e) => setNewWordsInput(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none h-28"
              placeholder={"Tape les mots, une phrase, ou une liste :\nEx: Jean-Paul ramasse des champignons\nOu: chat, chien, le soleil"}
              disabled={isAnalyzing}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={resetForm} disabled={isAnalyzing}>Annuler</Button>
            <Button
              onClick={handleAnalyzeText}
              disabled={!newWordsInput.trim() || isAnalyzing}
              isLoading={isAnalyzing}
            >
              Analyser les mots
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // LISTE DES DICTEES
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-indigo-900">Tableau de bord Enseignant</h2>
        <Button onClick={() => setIsCreating(true)}>+ Nouvelle Dictée</Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4" />
            <p className="text-slate-500">Chargement...</p>
          </div>
        ) : dictations.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-slate-500">Aucune dictée créée pour l'instant.</p>
            <p className="text-slate-400 text-sm mt-1">Cliquez sur « + Nouvelle Dictée » pour commencer.</p>
          </div>
        ) : (
          dictations.map((dict) => (
            <div key={dict.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{dict.title}</h3>
                <p className="text-slate-500 text-sm mb-2">{dict.words.length} mots - Créée le {new Date(dict.created_at).toLocaleDateString('fr-FR')}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(dict.code); }}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg w-fit transition-colors group"
                  title="Copier le code"
                >
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Code Élève :</span>
                  <span className="text-lg font-mono font-bold text-indigo-600">{dict.code}</span>
                  <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setDeleteTarget(dict.id)}
                className="text-red-400 hover:text-red-600 px-3 py-2 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Supprimer cette dictée ?"
        message="Cette action est irréversible."
        variant="warning"
      />
    </div>
  );
};
