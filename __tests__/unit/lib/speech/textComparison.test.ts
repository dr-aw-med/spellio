/**
 * Tests unitaires pour le service de comparaison de texte
 */

import {
  compareTexts,
  compareWord,
  detectGrammarErrors,
  ComparisonOptions,
} from '@/lib/speech/textComparison';
import { WordError } from '@/types/speech';

describe('textComparison', () => {
  describe('compareTexts', () => {
    it('devrait retourner une précision de 100% pour des textes identiques', () => {
      const result = compareTexts('bonjour monde', 'bonjour monde');
      expect(result.accuracy).toBe(1);
      expect(result.correctWords).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.totalWords).toBe(2);
    });

    it('devrait détecter les erreurs d\'orthographe', () => {
      const result = compareTexts('bonjour monde', 'bonjoure monde');
      expect(result.accuracy).toBeLessThan(1);
      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('devrait ignorer la casse par défaut', () => {
      const result = compareTexts('Bonjour Monde', 'bonjour monde');
      expect(result.accuracy).toBe(1);
      expect(result.correctWords).toBe(2);
    });

    it('devrait ignorer les accents par défaut', () => {
      const result = compareTexts('école été', 'ecole ete');
      expect(result.accuracy).toBe(1);
    });

    it('devrait ignorer la ponctuation par défaut', () => {
      const result = compareTexts('Bonjour, monde!', 'bonjour monde');
      expect(result.accuracy).toBe(1);
    });

    it('devrait détecter les mots manquants', () => {
      const result = compareTexts('bonjour monde test', 'bonjour monde');
      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors.some(e => e.type === 'missing')).toBe(true);
    });

    it('devrait détecter les mots supplémentaires', () => {
      const result = compareTexts('bonjour monde', 'bonjour monde test');
      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors.some(e => e.type === 'extra')).toBe(true);
    });

    it('devrait tolérer les mots manquants si l\'option est activée', () => {
      const options: ComparisonOptions = {
        tolerateMissingWords: true,
      };
      const result = compareTexts('bonjour monde test', 'bonjour monde', options);
      expect(result.errors.some(e => e.type === 'missing')).toBe(false);
    });

    it('devrait tolérer les mots supplémentaires si l\'option est activée', () => {
      const options: ComparisonOptions = {
        tolerateExtraWords: true,
      };
      const result = compareTexts('bonjour monde', 'bonjour monde test', options);
      expect(result.errors.some(e => e.type === 'extra')).toBe(false);
    });

    it('devrait respecter le seuil de similarité', () => {
      const options1: ComparisonOptions = {
        similarityThreshold: 0.9,
      };
      const options2: ComparisonOptions = {
        similarityThreshold: 0.7,
      };
      
      const result1 = compareTexts('bonjour', 'bonsoir', options1);
      const result2 = compareTexts('bonjour', 'bonsoir', options2);
      
      // Avec un seuil plus élevé, plus d'erreurs détectées
      expect(result1.errorCount).toBeGreaterThanOrEqual(result2.errorCount);
    });

    it('devrait nettoyer le texte reconnu (mots parasites)', () => {
      const result = compareTexts('bonjour monde', 'euh bonjour hum monde');
      expect(result.accuracy).toBe(1);
    });

    it('devrait gérer les textes vides', () => {
      const result1 = compareTexts('', '');
      expect(result1.accuracy).toBe(0);
      expect(result1.totalWords).toBe(0);

      const result2 = compareTexts('bonjour', '');
      expect(result2.errorCount).toBeGreaterThan(0);
    });

    it('devrait retourner des WordComparison pour chaque mot', () => {
      const result = compareTexts('bonjour monde', 'bonjour monde');
      expect(result.words.length).toBe(2);
      expect(result.words[0].isCorrect).toBe(true);
      expect(result.words[1].isCorrect).toBe(true);
    });

    it('devrait inclure les erreurs dans les WordComparison', () => {
      const result = compareTexts('bonjour monde', 'bonjoure monde');
      const incorrectWord = result.words.find(w => !w.isCorrect);
      expect(incorrectWord).toBeDefined();
      expect(incorrectWord?.errors.length).toBeGreaterThan(0);
    });
  });

  describe('compareWord', () => {
    it('devrait retourner correct pour des mots identiques', () => {
      const result = compareWord('bonjour', 'bonjour');
      expect(result.isCorrect).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.confidence).toBe(1);
    });

    it('devrait détecter les erreurs d\'orthographe', () => {
      const result = compareWord('bonjour', 'bonjoure');
      expect(result.isCorrect).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('spelling');
    });

    it('devrait respecter le seuil de similarité', () => {
      const result1 = compareWord('bonjour', 'bonsoir', 0.9);
      const result2 = compareWord('bonjour', 'bonsoir', 0.7);
      
      // Avec un seuil plus élevé, plus strict
      if (result1.isCorrect) {
        expect(result2.isCorrect).toBe(true);
      }
    });

    it('devrait normaliser les mots avant comparaison', () => {
      const result = compareWord('Bonjour', 'BONJOUR');
      expect(result.isCorrect).toBe(true);
    });

    it('devrait inclure les mots attendus et reconnus', () => {
      const result = compareWord('bonjour', 'bonjoure');
      expect(result.expected).toBe('bonjour');
      expect(result.recognized).toBe('bonjoure');
    });
  });

  describe('detectGrammarErrors', () => {
    it('devrait retourner un tableau vide pour l\'instant (fonction simplifiée)', () => {
      const errors = detectGrammarErrors('bonjour monde', 'bonjour monde');
      expect(errors).toEqual([]);
    });

    it('devrait être extensible pour détecter les erreurs grammaticales', () => {
      // Cette fonction est une structure de base
      // Elle peut être étendue avec des règles grammaticales plus complexes
      const errors = detectGrammarErrors('les chats', 'le chats');
      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('Options de comparaison', () => {
    it('devrait utiliser les options par défaut si non spécifiées', () => {
      const result = compareTexts('Bonjour, École!', 'bonjour ecole');
      expect(result.accuracy).toBe(1);
    });

    it('devrait permettre de personnaliser le seuil de similarité', () => {
      const options: ComparisonOptions = {
        similarityThreshold: 0.95,
      };
      const result = compareTexts('bonjour', 'bonsoir', options);
      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('devrait permettre de tolérer les mots manquants et supplémentaires', () => {
      const options: ComparisonOptions = {
        tolerateMissingWords: true,
        tolerateExtraWords: true,
      };
      const result = compareTexts('bonjour', 'bonjour monde test', options);
      // Ne devrait pas compter les mots supplémentaires comme erreurs
      expect(result.errors.filter(e => e.type === 'extra').length).toBe(0);
    });
  });
});

