import { useState } from 'react';
import { Button } from './Button';

interface WordListEditorProps {
  words: string[];
  onConfirm: (words: string[]) => void;
  onRetake: () => void;
}

export const WordListEditor = ({ words, onConfirm, onRetake }: WordListEditorProps) => {
  const [editedWords, setEditedWords] = useState<string[]>(words);

  const handleWordChange = (index: number, newValue: string) => {
    const newWords = [...editedWords];
    newWords[index] = newValue;
    setEditedWords(newWords);
  };

  const removeWord = (index: number) => {
    setEditedWords(editedWords.filter((_, i) => i !== index));
  };

  const addWord = () => {
    setEditedWords([...editedWords, ""]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in pb-24">
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">J'ai trouve ces mots :</h2>
          <button onClick={onRetake} className="text-sm text-slate-400 hover:text-red-500 underline">
            Refaire la photo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {editedWords.map((word, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-lg font-medium"
                placeholder="Mot..."
              />
              <button
                onClick={() => removeWord(index)}
                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Supprimer"
              >
                x
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addWord}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors"
        >
          + Ajouter un mot
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-center z-20">
        <Button onClick={() => onConfirm(editedWords.filter(w => w.trim() !== ''))} className="w-full max-w-md shadow-lg shadow-indigo-200">
          C'est tout bon !
        </Button>
      </div>
    </div>
  );
};
