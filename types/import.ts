/**
 * Types pour le système d'import de fichiers et OCR
 */

export type ImportSource = 'photo' | 'file' | 'text';

export type ImportMode = 'word-by-word' | 'full-text';

export type FileFormat = 'txt' | 'docx' | 'pdf' | 'jpg' | 'jpeg' | 'png' | 'md';

export type OCRLanguage = 'fra' | 'eng' | 'spa';

export interface ImportedFile {
  id: string;
  name: string;
  type: FileFormat;
  size: number;
  url?: string;
  uploadedAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: OCRLanguage;
  wordCount: number;
  processingTime: number;
  errors?: string[];
}

export interface TextExtractionResult {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pageCount?: number;
    wordCount: number;
  };
  format: FileFormat;
  extractedAt: Date;
}

export interface TextSegmentationResult {
  words: string[];
  sentences: string[];
  paragraphs: string[];
  totalWords: number;
  totalSentences: number;
  totalParagraphs: number;
}

export interface ImportPreview {
  extractedText: string;
  wordCount: number;
  sentenceCount: number;
  mode: ImportMode;
  source: ImportSource;
  file?: ImportedFile;
  ocrResult?: OCRResult;
}

export interface CreateDictationFromTextInput {
  title: string;
  text: string;
  mode: ImportMode;
  source: ImportSource;
  level: string;
  category: string;
  difficulty: string;
  description?: string;
  fileId?: string;
  profileId?: string;
}

export interface ImportedDictation {
  id: string;
  title: string;
  text: string;
  mode: ImportMode;
  source: ImportSource;
  profileId: string;
  fileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
  enhance?: {
    contrast?: number;
    brightness?: number;
    sharpen?: boolean;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number;
}

export interface OCRProcessingOptions {
  language?: OCRLanguage;
  psm?: number; // Page segmentation mode (Tesseract)
  oem?: number; // OCR Engine mode
  imageProcessing?: ImageProcessingOptions;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

