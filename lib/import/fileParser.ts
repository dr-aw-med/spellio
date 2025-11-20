/**
 * Service de parsing de fichiers et extraction de métadonnées
 */

import { TextExtractor } from './textExtractor';
import { TextSegmentation } from './textSegmentation';
import { FileFormat, TextExtractionResult, ImportPreview, ImportMode } from '@/types/import';

export class FileParser {
  /**
   * Parse un fichier et crée un aperçu pour l'import
   */
  static async parseFile(
    file: File,
    mode: ImportMode = 'word-by-word'
  ): Promise<ImportPreview> {
    // Extraire le texte
    const extractionResult = await TextExtractor.extractText(file);

    // Segmenter le texte
    const segmentation = TextSegmentation.segmentText(extractionResult.text);

    // Créer l'aperçu
    const preview: ImportPreview = {
      extractedText: extractionResult.text,
      wordCount: segmentation.totalWords,
      sentenceCount: segmentation.totalSentences,
      mode,
      source: 'file',
      file: {
        id: '', // Sera généré lors de la sauvegarde
        name: file.name,
        type: TextExtractor.getFileFormat(file),
        size: file.size,
        uploadedAt: new Date(),
      },
    };

    return preview;
  }

  /**
   * Parse un texte brut (saisie manuelle)
   */
  static parseText(
    text: string,
    mode: ImportMode = 'word-by-word'
  ): ImportPreview {
    // Segmenter le texte
    const segmentation = TextSegmentation.segmentText(text);

    // Créer l'aperçu
    const preview: ImportPreview = {
      extractedText: text,
      wordCount: segmentation.totalWords,
      sentenceCount: segmentation.totalSentences,
      mode,
      source: 'text',
    };

    return preview;
  }

  /**
   * Génère un titre suggéré depuis le contenu
   */
  static suggestTitle(text: string, fileName?: string): string {
    // Essayer d'extraire depuis le texte
    const extractedTitle = TextSegmentation.extractTitle(text);
    
    // Si on a un nom de fichier, l'utiliser comme base
    if (fileName) {
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      // Si le titre extrait est très différent du nom de fichier, utiliser le nom de fichier
      if (extractedTitle.toLowerCase() !== fileNameWithoutExt.toLowerCase()) {
        return fileNameWithoutExt;
      }
    }

    return extractedTitle;
  }

  /**
   * Valide qu'un fichier peut être parsé
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    return TextExtractor.validateFile(file);
  }

  /**
   * Obtient les métadonnées suggérées depuis le contenu
   */
  static suggestMetadata(text: string): {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedDuration: number;
    wordCount: number;
  } {
    const segmentation = TextSegmentation.segmentText(text);
    const difficulty = TextSegmentation.detectDifficulty(text);
    const estimatedDuration = TextSegmentation.estimateDuration(segmentation.totalWords);

    return {
      difficulty,
      estimatedDuration,
      wordCount: segmentation.totalWords,
    };
  }
}

