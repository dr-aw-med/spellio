/**
 * Composant d'upload de fichiers avec drag & drop
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useFileImport } from '@/hooks/useFileImport';
import { FileFormat } from '@/types/import';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onError?: (error: Error) => void;
  acceptedFormats?: FileFormat[];
  maxSize?: number; // en MB
  multiple?: boolean;
}

export function FileUpload({
  onFileSelected,
  onError,
  acceptedFormats = ['txt', 'md', 'docx', 'pdf'],
  maxSize = 50,
  multiple = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { validateFile, isProcessing } = useFileImport();

  const getAcceptedMimeTypes = useCallback((): string[] => {
    const mimeTypes: Record<FileFormat, string> = {
      txt: 'text/plain',
      md: 'text/markdown',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    return acceptedFormats.map(format => mimeTypes[format]).filter(Boolean);
  }, [acceptedFormats]);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setError(null);

      // Vérifier la taille
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const error = new Error(`Fichier trop volumineux. Taille maximum: ${maxSize} MB`);
        setError(error.message);
        onError?.(error);
        return;
      }

      // Valider le fichier
      const validation = validateFile(file);
      if (!validation.isValid) {
        const error = new Error(validation.error || 'Fichier invalide');
        setError(error.message);
        onError?.(error);
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected, onError, validateFile, maxSize]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      validateAndProcessFile(file);
    },
    [validateAndProcessFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      validateAndProcessFile(file);
    },
    [validateAndProcessFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const acceptedMimeTypes = getAcceptedMimeTypes();
  const acceptedExtensions = acceptedFormats.map(f => `.${f}`).join(',');

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMimeTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          multiple={multiple}
          disabled={isProcessing}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez
          </div>

          <p className="text-xs text-gray-500">
            Formats acceptés: {acceptedFormats.join(', ').toUpperCase()}
            <br />
            Taille maximum: {maxSize} MB
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-center">
          Traitement du fichier...
        </div>
      )}
    </div>
  );
}

