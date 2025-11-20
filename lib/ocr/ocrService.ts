/**
 * Service OCR utilisant Tesseract.js pour la reconnaissance de texte
 */

import { createWorker, Worker } from 'tesseract.js';
import { OCRResult, OCRLanguage, OCRProcessingOptions } from '@/types/import';

export class OCRService {
  private static workers: Map<OCRLanguage, Worker | null> = new Map();
  private static isInitialized = false;

  /**
   * Initialise un worker Tesseract pour une langue donnée
   */
  static async initializeWorker(language: OCRLanguage = 'fra'): Promise<Worker> {
    // Vérifier si un worker existe déjà pour cette langue
    const existingWorker = this.workers.get(language);
    if (existingWorker) {
      return existingWorker;
    }

    try {
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          // Logger optionnel pour le débogage
          if (process.env.NODE_ENV === 'development') {
            console.log('OCR Progress:', m);
          }
        },
      });

      // Configurer les options par défaut
      await worker.setParameters({
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine only
      });

      this.workers.set(language, worker);
      return worker;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du worker OCR:', error);
      throw new Error(`Impossible d'initialiser le worker OCR pour la langue ${language}`);
    }
  }

  /**
   * Traite une image et extrait le texte
   */
  static async processImage(
    imageFile: File | Blob | string,
    options: OCRProcessingOptions = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();
    const language = options.language || 'fra';

    try {
      // Initialiser le worker si nécessaire
      const worker = await this.initializeWorker(language);

      // Appliquer les options de traitement d'image si nécessaire
      let imageToProcess: File | Blob | string = imageFile;

      if (options.imageProcessing) {
        // Note: Le traitement d'image devrait être fait avant d'appeler cette fonction
        // Ici on accepte directement l'image traitée
      }

      // Configurer les paramètres OCR si spécifiés
      if (options.psm !== undefined) {
        await worker.setParameters({
          tessedit_pageseg_mode: options.psm.toString(),
        });
      }

      if (options.oem !== undefined) {
        await worker.setParameters({
          tessedit_ocr_engine_mode: options.oem.toString(),
        });
      }

      // Effectuer la reconnaissance
      const { data } = await worker.recognize(imageToProcess);

      const processingTime = Date.now() - startTime;
      const text = data.text.trim();
      const confidence = data.confidence || 0;
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

      // Détecter les erreurs potentielles
      const errors: string[] = [];
      if (confidence < 50) {
        errors.push('Confiance faible - le texte peut contenir des erreurs');
      }
      if (text.length === 0) {
        errors.push('Aucun texte détecté dans l\'image');
      }
      if (wordCount < 3) {
        errors.push('Très peu de mots détectés - vérifiez la qualité de l\'image');
      }

      return {
        text,
        confidence,
        language,
        wordCount,
        processingTime,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Erreur lors du traitement OCR:', error);
      throw new Error(
        `Erreur lors de la reconnaissance de texte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Nettoie et normalise le texte extrait
   */
  static normalizeText(text: string): string {
    // Supprimer les espaces multiples
    let normalized = text.replace(/\s+/g, ' ');

    // Corriger les retours à la ligne mal formatés
    normalized = normalized.replace(/\n\s*\n/g, '\n\n');

    // Supprimer les espaces en début et fin
    normalized = normalized.trim();

    // Corriger les caractères spéciaux courants
    normalized = normalized
      .replace(/[""]/g, '"') // Guillemets typographiques
      .replace(/['']/g, "'") // Apostrophes typographiques
      .replace(/…/g, '...') // Points de suspension
      .replace(/–/g, '-') // Tirets
      .replace(/—/g, '-'); // Tirets longs

    return normalized;
  }

  /**
   * Détecte automatiquement la langue du texte
   */
  static async detectLanguage(text: string): Promise<OCRLanguage> {
    // Analyse simple basée sur les caractères et mots courants
    // Note: Pour une détection plus précise, utiliser une bibliothèque dédiée

    const frenchIndicators = /[àâäéèêëïîôùûüÿç]/i;
    const spanishIndicators = /[áéíóúñü¿¡]/i;
    const englishIndicators = /\b(the|and|is|are|was|were|have|has)\b/i;

    const hasFrench = frenchIndicators.test(text);
    const hasSpanish = spanishIndicators.test(text);
    const hasEnglish = englishIndicators.test(text);

    if (hasFrench && !hasSpanish && !hasEnglish) return 'fra';
    if (hasSpanish && !hasFrench && !hasEnglish) return 'spa';
    if (hasEnglish && !hasFrench && !hasSpanish) return 'eng';

    // Par défaut, retourner français
    return 'fra';
  }

  /**
   * Termine tous les workers OCR
   */
  static async terminateAllWorkers(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [language, worker] of this.workers.entries()) {
      if (worker) {
        promises.push(
          worker.terminate().then(() => {
            this.workers.set(language, null);
          })
        );
      }
    }

    await Promise.all(promises);
    this.workers.clear();
  }

  /**
   * Vérifie si l'OCR est supporté dans le navigateur
   */
  static isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof Blob !== 'undefined';
  }

  /**
   * Obtient les langues disponibles
   */
  static getAvailableLanguages(): OCRLanguage[] {
    return ['fra', 'eng', 'spa'];
  }
}

