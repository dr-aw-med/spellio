import { useState, useEffect, useRef } from 'react';
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDictations();
  }, []);

  // Nettoyage de la reconnaissance vocale au démontage
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setError('La reconnaissance vocale n\'est pas supportée par ton navigateur.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { length: number; [key: number]: { [key: number]: { transcript: string } } } }) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNewWordsInput(prev => {
        const separator = prev.trim() ? ' ' : '';
        return prev + separator + transcript;
      });
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

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
                accept="image/*,.heic,.heif"
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
            <div className="relative">
              <textarea
                value={newWordsInput}
                onChange={(e) => setNewWordsInput(e.target.value)}
                className="w-full p-3 pr-14 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none h-28"
                placeholder={"Tape les mots, une phrase, ou une liste :\nEx: Jean-Paul ramasse des champignons\nOu: chat, chien, le soleil"}
                disabled={isAnalyzing}
              />
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`absolute top-2 right-2 p-2.5 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                    : 'bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600'
                }`}
                title={isRecording ? 'Arrêter la dictée vocale' : 'Dicter les mots'}
              >
                {isRecording ? (
                  <span className="relative flex items-center justify-center w-5 h-5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(dict.code);
                      setCopiedCode(dict.code);
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg w-fit transition-colors group"
                    title="Copier le code"
                  >
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Code Élève :</span>
                    <span className="text-lg font-mono font-bold text-indigo-600">{dict.code}</span>
                    {copiedCode === dict.code ? (
                      <span className="text-xs font-bold text-green-600 animate-fade-in">Copié !</span>
                    ) : (
                      <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setQrCode(dict.code)}
                    className="flex items-center gap-1.5 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors text-pink-600 hover:text-pink-700 font-medium text-sm"
                    title="Afficher le QR code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm14 3h.01M17 17h.01M21 17h.01M14 14h3v3h-3v-3zm4 0h3v3h-3v-3zm-4 4h3v3h-3v-3zm4 0h3v3h-3v-3z" />
                    </svg>
                    QR
                  </button>
                </div>
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

      {/* Modal QR Code */}
      {qrCode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setQrCode(null)}>
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">QR Code de la dictée</h3>
            <p className="text-sm text-slate-500 text-center mb-4">
              Les élèves peuvent scanner ce QR code pour accéder directement à la dictée.
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://spellio.org?code=${qrCode}`)}`}
                alt={`QR Code pour le code ${qrCode}`}
                className="rounded-xl"
                width={200}
                height={200}
              />
            </div>
            <p className="text-center font-mono font-bold text-indigo-600 text-lg mb-4">{qrCode}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => {
                  const url = `https://spellio.org?code=${qrCode}`;
                  if (navigator.share) {
                    navigator.share({ title: 'Dictée Spellio', text: `Fais ta dictée sur Spellio avec le code ${qrCode}`, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Lien copié !');
                  }
                }}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-colors"
              >
                Partager
              </button>
              <button
                onClick={() => setQrCode(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
