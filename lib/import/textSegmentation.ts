/**
 * Service de segmentation et parsing de texte
 */

import { TextSegmentationResult } from '@/types/import';

export class TextSegmentation {
  /**
   * Segmente un texte en mots, phrases et paragraphes
   */
  static segmentText(text: string): TextSegmentationResult {
    // Nettoyer le texte
    const cleanedText = this.cleanText(text);

    // Segmenter en paragraphes
    const paragraphs = this.segmentParagraphs(cleanedText);

    // Segmenter en phrases
    const sentences = this.segmentSentences(cleanedText);

    // Segmenter en mots
    const words = this.segmentWords(cleanedText);

    return {
      words,
      sentences,
      paragraphs,
      totalWords: words.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
    };
  }

  /**
   * Nettoie le texte (supprime les espaces multiples, normalise)
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/\n\s*\n/g, '\n\n') // Normaliser les retours à la ligne
      .trim();
  }

  /**
   * Segmente le texte en paragraphes
   */
  private static segmentParagraphs(text: string): string[] {
    // Séparer par doubles retours à la ligne ou plus
    const paragraphs = text
      .split(/\n\s*\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return paragraphs.length > 0 ? paragraphs : [text];
  }

  /**
   * Segmente le texte en phrases
   */
  private static segmentSentences(text: string): string[] {
    // Détecter les fins de phrases (point, point d'exclamation, point d'interrogation)
    // Suivis d'un espace et d'une majuscule ou fin de texte
    const sentenceRegex = /[.!?]+(?:\s+|$)/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = match.index + match[0].length;
    }

    // Ajouter le reste du texte s'il y en a
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim();
      if (remaining.length > 0) {
        sentences.push(remaining);
      }
    }

    return sentences.length > 0 ? sentences : [text];
  }

  /**
   * Segmente le texte en mots
   */
  private static segmentWords(text: string): string[] {
    // Séparer par espaces et ponctuation, mais garder les mots avec apostrophes
    const words = text
      .split(/[\s\.,;:!?()\[\]{}"«»''""]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);

    return words;
  }

  /**
   * Crée une dictée "mot par mot" depuis un texte
   */
  static createWordByWordDictation(text: string): string[] {
    const words = this.segmentWords(text);
    return words.filter(word => word.length > 0);
  }

  /**
   * Crée une dictée "texte complet" depuis un texte
   */
  static createFullTextDictation(text: string): string {
    return this.cleanText(text);
  }

  /**
   * Extrait le titre depuis un texte (première ligne ou première phrase)
   */
  static extractTitle(text: string, maxLength: number = 100): string {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Si la première ligne est courte, c'est probablement un titre
      if (firstLine.length <= maxLength && firstLine.length < 200) {
        return firstLine;
      }
    }

    // Sinon, prendre la première phrase
    const sentences = this.segmentSentences(text);
    if (sentences.length > 0) {
      const firstSentence = sentences[0];
      if (firstSentence.length <= maxLength) {
        return firstSentence;
      }
      // Tronquer si trop long
      return firstSentence.substring(0, maxLength - 3) + '...';
    }

    // Par défaut, tronquer le texte
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Estime la durée d'une dictée en minutes
   */
  static estimateDuration(wordCount: number, wordsPerMinute: number = 20): number {
    // Estimation basée sur un rythme de 20 mots par minute pour un enfant
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Détecte automatiquement le niveau de difficulté
   */
  static detectDifficulty(text: string): 'easy' | 'medium' | 'hard' {
    const words = this.segmentWords(text);
    const sentences = this.segmentSentences(text);
    
    // Calculer la longueur moyenne des mots
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Calculer la longueur moyenne des phrases
    const avgSentenceLength = words.length / sentences.length;

    // Critères de difficulté
    if (avgWordLength < 4 && avgSentenceLength < 8) {
      return 'easy';
    } else if (avgWordLength < 6 && avgSentenceLength < 15) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  /**
   * Nettoie et normalise le texte pour la dictée
   */
  static normalizeForDictation(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Espaces multiples
      .replace(/\n\s*\n/g, '\n\n') // Paragraphes
      .replace(/[""]/g, '"') // Guillemets
      .replace(/['']/g, "'") // Apostrophes
      .trim();
  }
}

