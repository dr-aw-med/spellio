/**
 * Hook React pour utiliser le service OCR
 */

import { useState, useCallback } from 'react';
import { OCRService } from '@/lib/ocr/ocrService';
import { ImageProcessor } from '@/lib/ocr/imageProcessing';
import { OCRResult, OCRLanguage, OCRProcessingOptions, ImageProcessingOptions } from '@/types/import';

export interface UseOCROptions {
  language?: OCRLanguage;
  onProgress?: (progress: number) => void;
  onComplete?: (result: OCRResult) => void;
  onError?: (error: Error) => void;
  imageProcessing?: ImageProcessingOptions;
}

export interface UseOCRReturn {
  processImage: (file: File) => Promise<OCRResult>;
  isProcessing: boolean;
  result: OCRResult | null;
  error: Error | null;
  reset: () => void;
  isSupported: boolean;
}

export function useOCR(options: UseOCROptions = {}): UseOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const processImage = useCallback(
    async (file: File): Promise<OCRResult> => {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      try {
        // Valider la qualité de l'image
        const validation = await ImageProcessor.validateImageQuality(file);
        if (!validation.isValid) {
          throw new Error(
            `Image invalide: ${validation.issues.join(', ')}. ${validation.recommendations.join(', ')}`
          );
        }

        // Traiter l'image si nécessaire
        let processedFile = file;
        if (options.imageProcessing) {
          processedFile = await ImageProcessor.processImage(file, options.imageProcessing);
        }

        // Configurer les options OCR
        const ocrOptions: OCRProcessingOptions = {
          language: options.language || 'fra',
          imageProcessing: options.imageProcessing,
        };

        // Effectuer la reconnaissance
        const ocrResult = await OCRService.processImage(processedFile, ocrOptions);

        // Normaliser le texte
        ocrResult.text = OCRService.normalizeText(ocrResult.text);

        setResult(ocrResult);
        options.onComplete?.(ocrResult);

        return ocrResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur inconnue lors du traitement OCR');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    processImage,
    isProcessing,
    result,
    error,
    reset,
    isSupported: OCRService.isSupported(),
  };
}

