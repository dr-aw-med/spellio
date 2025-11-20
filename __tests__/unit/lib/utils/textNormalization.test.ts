/**
 * Tests unitaires pour les utilitaires de normalisation de texte
 */

import {
  normalizeText,
  normalizeTextKeepPunctuation,
  removeAccents,
  tokenizeText,
  tokenizeTextKeepPunctuation,
  cleanRecognizedText,
  levenshteinDistance,
  similarity,
  areWordsSimilar,
  findClosestWord,
} from '@/lib/utils/textNormalization';

describe('textNormalization', () => {
  describe('normalizeText', () => {
    it('devrait convertir en minuscules', () => {
      expect(normalizeText('BONJOUR')).toBe('bonjour');
      expect(normalizeText('Bonjour')).toBe('bonjour');
    });

    it('devrait supprimer les accents', () => {
      expect(normalizeText('été')).toBe('ete');
      expect(normalizeText('école')).toBe('ecole');
      expect(normalizeText('naïve')).toBe('naive');
    });

    it('devrait supprimer la ponctuation', () => {
      expect(normalizeText('Bonjour!')).toBe('bonjour');
      expect(normalizeText('Comment allez-vous?')).toBe('comment allez vous');
      expect(normalizeText('C\'est...')).toBe('cest');
    });

    it('devrait normaliser les espaces', () => {
      expect(normalizeText('bonjour   monde')).toBe('bonjour monde');
      expect(normalizeText('  bonjour  monde  ')).toBe('bonjour monde');
      expect(normalizeText('bonjour\nmonde')).toBe('bonjour monde');
    });

    it('devrait gérer les cas combinés', () => {
      expect(normalizeText('  BONJOUR, ÉCOLE!  ')).toBe('bonjour ecole');
      expect(normalizeText('C\'est l\'été!')).toBe('cest lete');
    });
  });

  describe('normalizeTextKeepPunctuation', () => {
    it('devrait normaliser mais conserver la ponctuation', () => {
      expect(normalizeTextKeepPunctuation('Bonjour!')).toBe('bonjour!');
      expect(normalizeTextKeepPunctuation('Comment allez-vous?')).toBe(
        'comment allez-vous?'
      );
    });

    it('devrait supprimer les accents', () => {
      expect(normalizeTextKeepPunctuation('été')).toBe('ete');
      expect(normalizeTextKeepPunctuation('école')).toBe('ecole');
    });

    it('devrait normaliser les espaces', () => {
      expect(normalizeTextKeepPunctuation('  bonjour  monde  ')).toBe(
        'bonjour monde'
      );
    });
  });

  describe('removeAccents', () => {
    it('devrait supprimer tous les accents', () => {
      expect(removeAccents('été')).toBe('ete');
      expect(removeAccents('école')).toBe('ecole');
      expect(removeAccents('naïve')).toBe('naive');
      expect(removeAccents('café')).toBe('cafe');
      expect(removeAccents('résumé')).toBe('resume');
    });

    it('devrait conserver les lettres sans accents', () => {
      expect(removeAccents('bonjour')).toBe('bonjour');
      expect(removeAccents('hello')).toBe('hello');
    });
  });

  describe('tokenizeText', () => {
    it('devrait diviser un texte en mots', () => {
      expect(tokenizeText('bonjour monde')).toEqual(['bonjour', 'monde']);
      expect(tokenizeText('bonjour   monde')).toEqual(['bonjour', 'monde']);
    });

    it('devrait normaliser et supprimer la ponctuation', () => {
      expect(tokenizeText('Bonjour, monde!')).toEqual(['bonjour', 'monde']);
      expect(tokenizeText('C\'est l\'été!')).toEqual(['cest', 'lete']);
    });

    it('devrait gérer les espaces multiples', () => {
      expect(tokenizeText('bonjour    monde   test')).toEqual([
        'bonjour',
        'monde',
        'test',
      ]);
    });

    it('devrait retourner un tableau vide pour une chaîne vide', () => {
      expect(tokenizeText('')).toEqual([]);
      expect(tokenizeText('   ')).toEqual([]);
    });
  });

  describe('tokenizeTextKeepPunctuation', () => {
    it('devrait diviser en tokens en conservant la ponctuation', () => {
      const tokens = tokenizeTextKeepPunctuation('Bonjour, monde!');
      expect(tokens).toContain('bonjour');
      expect(tokens).toContain(',');
      expect(tokens).toContain('monde');
      expect(tokens).toContain('!');
    });

    it('devrait supprimer les accents', () => {
      const tokens = tokenizeTextKeepPunctuation('C\'est l\'été!');
      expect(tokens).toContain('c');
      expect(tokens).toContain("'");
      expect(tokens).toContain('ete');
    });
  });

  describe('cleanRecognizedText', () => {
    it('devrait supprimer les mots parasites', () => {
      expect(cleanRecognizedText('euh bonjour euh monde')).toBe(
        'bonjour monde'
      );
      expect(cleanRecognizedText('hum alors bonjour')).toBe('bonjour');
      expect(cleanRecognizedText('ah ben voilà')).toBe('');
    });

    it('devrait normaliser les espaces', () => {
      expect(cleanRecognizedText('bonjour    monde')).toBe('bonjour monde');
      expect(cleanRecognizedText('  bonjour  monde  ')).toBe('bonjour monde');
    });

    it('devrait convertir en minuscules', () => {
      expect(cleanRecognizedText('BONJOUR MONDE')).toBe('bonjour monde');
    });

    it('devrait gérer les cas combinés', () => {
      expect(cleanRecognizedText('euh BONJOUR   hum monde')).toBe(
        'bonjour monde'
      );
    });
  });

  describe('levenshteinDistance', () => {
    it('devrait calculer la distance entre deux chaînes identiques', () => {
      expect(levenshteinDistance('bonjour', 'bonjour')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('devrait calculer la distance pour des chaînes différentes', () => {
      expect(levenshteinDistance('bonjour', 'bonsoir')).toBe(2);
      expect(levenshteinDistance('chat', 'chats')).toBe(1);
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('devrait gérer les chaînes vides', () => {
      expect(levenshteinDistance('', 'bonjour')).toBe(7);
      expect(levenshteinDistance('bonjour', '')).toBe(7);
    });

    it('devrait être symétrique', () => {
      expect(levenshteinDistance('abc', 'def')).toBe(
        levenshteinDistance('def', 'abc')
      );
    });
  });

  describe('similarity', () => {
    it('devrait retourner 1 pour des chaînes identiques', () => {
      expect(similarity('bonjour', 'bonjour')).toBe(1);
      expect(similarity('', '')).toBe(1);
    });

    it('devrait retourner 0 pour des chaînes complètement différentes', () => {
      expect(similarity('abc', 'xyz')).toBeLessThan(0.5);
    });

    it('devrait retourner une valeur entre 0 et 1', () => {
      const sim = similarity('bonjour', 'bonsoir');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThanOrEqual(1);
    });

    it('devrait être symétrique', () => {
      expect(similarity('abc', 'def')).toBe(similarity('def', 'abc'));
    });
  });

  describe('areWordsSimilar', () => {
    it('devrait retourner true pour des mots identiques', () => {
      expect(areWordsSimilar('bonjour', 'bonjour')).toBe(true);
      expect(areWordsSimilar('BONJOUR', 'bonjour')).toBe(true);
    });

    it('devrait retourner true pour des mots similaires au-dessus du seuil', () => {
      expect(areWordsSimilar('bonjour', 'bonsoir', 0.7)).toBe(true);
      expect(areWordsSimilar('chat', 'chats', 0.8)).toBe(true);
    });

    it('devrait retourner false pour des mots trop différents', () => {
      expect(areWordsSimilar('bonjour', 'au revoir', 0.8)).toBe(false);
      expect(areWordsSimilar('chat', 'chien', 0.9)).toBe(false);
    });

    it('devrait respecter le seuil de similarité', () => {
      expect(areWordsSimilar('bonjour', 'bonsoir', 0.9)).toBe(false);
      expect(areWordsSimilar('bonjour', 'bonsoir', 0.7)).toBe(true);
    });

    it('devrait ignorer les accents et la casse', () => {
      expect(areWordsSimilar('école', 'ecole')).toBe(true);
      expect(areWordsSimilar('ÉCOLE', 'ecole')).toBe(true);
    });
  });

  describe('findClosestWord', () => {
    it('devrait trouver le mot le plus proche dans une liste', () => {
      const wordList = ['bonjour', 'bonsoir', 'bonne', 'bon'];
      const result = findClosestWord('bonjoure', wordList);
      expect(result).not.toBeNull();
      expect(result?.word).toBe('bonjour');
      expect(result?.similarity).toBeGreaterThan(0.7);
    });

    it('devrait retourner null si aucun mot ne dépasse le seuil', () => {
      const wordList = ['bonjour', 'bonsoir'];
      const result = findClosestWord('xyzabc', wordList, 0.8);
      expect(result).toBeNull();
    });

    it('devrait respecter le seuil de similarité', () => {
      const wordList = ['bonjour', 'bonsoir'];
      const result1 = findClosestWord('bonjoure', wordList, 0.9);
      const result2 = findClosestWord('bonjoure', wordList, 0.7);
      expect(result1).toBeNull();
      expect(result2).not.toBeNull();
    });

    it('devrait gérer les listes vides', () => {
      const result = findClosestWord('bonjour', []);
      expect(result).toBeNull();
    });

    it('devrait trouver le meilleur match même avec plusieurs candidats', () => {
      const wordList = ['chat', 'chats', 'chien', 'chats'];
      const result = findClosestWord('chat', wordList);
      expect(result?.word).toBe('chat');
      expect(result?.similarity).toBe(1);
    });
  });
});

