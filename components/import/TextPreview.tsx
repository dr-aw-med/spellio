/**
 * Composant de prévisualisation du texte extrait
 */

'use client';

import { useState } from 'react';
import { ImportPreview } from '@/types/import';

interface TextPreviewProps {
  preview: ImportPreview;
  onEdit?: (text: string) => void;
  editable?: boolean;
}

export function TextPreview({ preview, onEdit, editable = true }: TextPreviewProps) {
  const [text, setText] = useState(preview.extractedText);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onEdit?.(newText);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">Aperçu du texte</h3>
          <div className="text-sm text-gray-600">
            {preview.wordCount} mots • {preview.sentenceCount} phrases
          </div>
        </div>

        {editable ? (
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Le texte extrait apparaîtra ici..."
          />
        ) : (
          <div className="w-full h-64 p-3 border border-gray-300 rounded-md bg-white font-mono text-sm overflow-auto">
            {text || <span className="text-gray-400">Aucun texte à afficher</span>}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Mode: {preview.mode === 'word-by-word' ? 'Mot par mot' : 'Texte complet'}
        </div>
      </div>

      {preview.ocrResult && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm">
            <div className="font-semibold mb-1">Résultats OCR:</div>
            <div>Confiance: {preview.ocrResult.confidence.toFixed(1)}%</div>
            <div>Temps de traitement: {(preview.ocrResult.processingTime / 1000).toFixed(1)}s</div>
            {preview.ocrResult.errors && preview.ocrResult.errors.length > 0 && (
              <div className="mt-2 text-orange-600">
                <div className="font-semibold">Avertissements:</div>
                <ul className="list-disc list-inside">
                  {preview.ocrResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

