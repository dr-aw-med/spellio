/**
 * Composant de capture photo (webcam ou upload)
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useOCR } from '@/hooks/useOCR';
import { ImageProcessor } from '@/lib/ocr/imageProcessing';

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // en MB
  allowedFormats?: string[];
}

export function PhotoCapture({
  onCapture,
  onError,
  maxSize = 10,
  allowedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const { processImage: processOCR, isProcessing: isOCRProcessing } = useOCR({
    onError: (err) => {
      setError(err.message);
      onError?.(err);
    },
  });

  // Activer la webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Caméra arrière si disponible
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Impossible d\'accéder à la caméra');
      setError(error.message);
      onError?.(error);
    }
  }, [onError]);

  // Arrêter la webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  }, []);

  // Capturer une photo depuis la webcam
  const captureFromWebcam = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Valider la qualité
          const validation = await ImageProcessor.validateImageQuality(file);
          if (!validation.isValid) {
            setError(validation.issues.join(', '));
            return;
          }

          // Créer une prévisualisation
          const previewUrl = URL.createObjectURL(blob);
          setPreview(previewUrl);

          // Arrêter la webcam
          stopWebcam();

          onCapture(file);
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la capture');
      setError(error.message);
      onError?.(error);
    }
  }, [onCapture, onError, stopWebcam]);

  // Gérer l'upload de fichier
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Vérifier le format
      if (!allowedFormats.includes(file.type)) {
        const error = new Error(`Format non supporté. Formats acceptés: ${allowedFormats.join(', ')}`);
        setError(error.message);
        onError?.(error);
        return;
      }

      // Vérifier la taille
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const error = new Error(`Fichier trop volumineux. Taille maximum: ${maxSize} MB`);
        setError(error.message);
        onError?.(error);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Valider la qualité
        const validation = await ImageProcessor.validateImageQuality(file);
        if (!validation.isValid) {
          throw new Error(validation.issues.join(', '));
        }

        // Créer une prévisualisation
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        onCapture(file);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors du traitement de l\'image');
        setError(error.message);
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onCapture, onError, allowedFormats, maxSize]
  );

  // Réinitialiser
  const reset = useCallback(() => {
    setPreview(null);
    setError(null);
    stopWebcam();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopWebcam]);

  return (
    <div className="space-y-4">
      {/* Prévisualisation */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Aperçu"
            className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
          />
          <button
            onClick={reset}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            aria-label="Supprimer l'image"
          >
            ×
          </button>
        </div>
      )}

      {/* Webcam */}
      {!preview && (
        <div className="space-y-4">
          {isWebcamActive ? (
            <div className="space-y-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={captureFromWebcam}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={isProcessing}
                >
                  Capturer
                </button>
                <button
                  onClick={stopWebcam}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Arrêter
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startWebcam}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Activer la caméra
            </button>
          )}
        </div>
      )}

      {/* Upload de fichier */}
      {!preview && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFormats.join(',')}
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="photo-upload"
            className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer text-center"
          >
            {isProcessing ? 'Traitement...' : 'Choisir une photo'}
          </label>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

