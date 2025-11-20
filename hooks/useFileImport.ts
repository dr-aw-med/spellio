/**
 * Hook React pour l'import de fichiers
 */

import { useState, useCallback } from 'react';
import { TextExtractor } from '@/lib/import/textExtractor';
import { FileParser } from '@/lib/import/fileParser';
import { ImportPreview, ImportMode, FileUploadProgress } from '@/types/import';

export interface UseFileImportOptions {
  mode?: ImportMode;
  onProgress?: (progress: FileUploadProgress) => void;
  onComplete?: (preview: ImportPreview) => void;
  onError?: (error: Error) => void;
}

export interface UseFileImportReturn {
  importFile: (file: File) => Promise<ImportPreview>;
  importText: (text: string) => ImportPreview;
  isProcessing: boolean;
  preview: ImportPreview | null;
  error: Error | null;
  reset: () => void;
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

export function useFileImport(options: UseFileImportOptions = {}): UseFileImportReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const importFile = useCallback(
    async (file: File): Promise<ImportPreview> => {
      setIsProcessing(true);
      setError(null);
      setPreview(null);

      try {
        // Valider le fichier
        const validation = FileParser.validateFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Fichier invalide');
        }

        // Notifier le début du traitement
        options.onProgress?.({
          loaded: 0,
          total: file.size,
          percentage: 0,
          status: 'processing',
        });

        // Parser le fichier
        const importPreview = await FileParser.parseFile(file, options.mode || 'word-by-word');

        // Notifier la fin
        options.onProgress?.({
          loaded: file.size,
          total: file.size,
          percentage: 100,
          status: 'completed',
        });

        setPreview(importPreview);
        options.onComplete?.(importPreview);

        return importPreview;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de l\'import du fichier');
        setError(error);
        options.onProgress?.({
          loaded: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          error: error.message,
        });
        options.onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [options]
  );

  const importText = useCallback(
    (text: string): ImportPreview => {
      setError(null);
      const importPreview = FileParser.parseText(text, options.mode || 'word-by-word');
      setPreview(importPreview);
      options.onComplete?.(importPreview);
      return importPreview;
    },
    [options]
  );

  const validateFile = useCallback((file: File) => {
    return FileParser.validateFile(file);
  }, []);

  const reset = useCallback(() => {
    setPreview(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    importFile,
    importText,
    isProcessing,
    preview,
    error,
    reset,
    validateFile,
  };
}

