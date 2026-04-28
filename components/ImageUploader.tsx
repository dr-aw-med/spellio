import { useState } from 'react';
import { Button } from './Button';
import { getDictationByCode } from '../services/storageService';
import { compressImage } from '../utils/imageUtils';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  onCodeValidated: (words: string[]) => void;
  isProcessing: boolean;
}

export const ImageUploader = ({ onImageSelected, onCodeValidated, isProcessing }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const processFile = async (file: File) => {
    setFileError('');
    try {
      const { base64, mimeType } = await compressImage(file);
      setPreview(URL.createObjectURL(file));
      onImageSelected(base64, mimeType);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'Erreur lors du traitement.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleCodeSubmit = async () => {
    setCodeError('');
    if (!code.trim()) return;

    setIsCheckingCode(true);
    try {
      const dictation = await getDictationByCode(code);
      if (dictation) {
        onCodeValidated(dictation.words);
      } else {
        setCodeError("Ce code n'existe pas. Vérifie avec ton professeur.");
      }
    } catch {
      setCodeError("Erreur de connexion. Réessaie.");
    } finally {
      setIsCheckingCode(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto animate-fade-in gap-8">
      {/* Option 1: Code */}
      <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-indigo-900 mb-3 text-center">J'ai un code dictée</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: AB12CD"
            className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono text-center tracking-wider font-bold"
            maxLength={6}
            onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
          />
          <Button onClick={handleCodeSubmit} disabled={code.length < 3 || isCheckingCode}>
            {isCheckingCode ? '...' : 'Go'}
          </Button>
        </div>
        {codeError && <p className="text-red-500 text-sm mt-2 text-center font-medium">{codeError}</p>}
      </div>

      <div className="relative w-full flex items-center justify-center">
        <div className="border-t border-slate-200 w-full absolute" />
        <span className="bg-[#F5F0FA] px-4 py-1 rounded-full text-slate-400 font-semibold relative z-10 text-sm">OU</span>
      </div>

      {/* Option 2: Upload */}
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Je prends une photo</h2>
        <p className="text-slate-500 mb-4 text-sm">Prends ta liste de mots en photo.</p>

        <label
          className={`flex flex-col items-center justify-center w-full h-56 border-4 border-dashed rounded-3xl cursor-pointer transition-all relative overflow-hidden group
            ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-indigo-100 bg-white hover:bg-indigo-50'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              <svg className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-indigo-600' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mb-1 text-sm text-slate-500 font-semibold">
                {isDragging ? 'Dépose la photo ici !' : 'Touche ou glisse une photo'}
              </p>
            </div>
          )}

          <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} disabled={isProcessing} />

          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-3" />
              <p className="text-indigo-600 font-medium animate-pulse">Analyse...</p>
            </div>
          )}
        </label>
        {fileError && <p className="text-red-500 text-sm mt-2 text-center font-medium">{fileError}</p>}
      </div>
    </div>
  );
};
