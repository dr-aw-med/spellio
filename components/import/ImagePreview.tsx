/**
 * Composant de prévisualisation d'image avec outils de recadrage et rotation
 */

'use client';

import { useState, useRef } from 'react';
import { ImageProcessor, ImageProcessingOptions } from '@/lib/ocr/imageProcessing';

interface ImagePreviewProps {
  imageFile: File;
  onProcessed?: (file: File) => void;
  onRemove?: () => void;
}

export function ImagePreview({ imageFile, onProcessed, onRemove }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>(URL.createObjectURL(imageFile));
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleRotate = async () => {
    setIsProcessing(true);
    try {
      const newRotation = (rotation + 90) % 360;
      const rotatedFile = await ImageProcessor.rotateImage(imageFile, newRotation);
      setRotation(newRotation);
      setPreview(URL.createObjectURL(rotatedFile));
      onProcessed?.(rotatedFile);
    } catch (error) {
      console.error('Erreur lors de la rotation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnhance = async () => {
    setIsProcessing(true);
    try {
      const enhancedFile = await ImageProcessor.enhanceImage(imageFile, {
        contrast: 1.2,
        brightness: 0.1,
        sharpen: true,
      });
      setPreview(URL.createObjectURL(enhancedFile));
      onProcessed?.(enhancedFile);
    } catch (error) {
      console.error('Erreur lors de l\'amélioration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg p-4">
        <img
          src={preview}
          alt="Aperçu"
          className="max-w-full max-h-96 mx-auto rounded-lg"
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            aria-label="Supprimer l'image"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRotate}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          🔄 Tourner
        </button>
        <button
          onClick={handleEnhance}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          ✨ Améliorer
        </button>
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          Traitement en cours...
        </div>
      )}
    </div>
  );
}

