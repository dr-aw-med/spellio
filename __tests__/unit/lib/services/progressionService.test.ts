/**
 * Tests unitaires pour le service de progression
 */

import {
  getDictationProgress,
  recordDictationAttempt,
} from '@/lib/services/progressionService';
import { SchoolLevel } from '@/types/dictation';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    dictationProgress: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    dictationAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    dictation: {
      findUnique: jest.fn(),
    },
  },
}));

describe('progressionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDictationProgress', () => {
    it('devrait retourner la progression d\'un profil pour une dictée', async () => {
      // TODO: Implémenter avec mock de Prisma
      // const mockProgress = {
      //   profileId: 'profile1',
      //   dictationId: 'dict1',
      //   isCompleted: false,
      //   isUnlocked: true,
      // };
      // (prisma.dictationProgress.findUnique as jest.Mock).mockResolvedValue(mockProgress);
      // const result = await getDictationProgress('profile1', 'dict1');
      // expect(result).toBeDefined();
      // expect(result?.profileId).toBe('profile1');
    });

    it('devrait créer une progression par défaut si elle n\'existe pas', async () => {
      // TODO: Implémenter avec mock de Prisma
      // (prisma.dictationProgress.findUnique as jest.Mock).mockResolvedValue(null);
      // const mockDictation = {
      //   id: 'dict1',
      //   level: SchoolLevel.CP,
      // };
      // (prisma.dictation.findUnique as jest.Mock).mockResolvedValue(mockDictation);
      // const result = await getDictationProgress('profile1', 'dict1');
      // expect(result).toBeDefined();
      // expect(result?.isUnlocked).toBe(true); // CP toujours débloqué
    });

    it('devrait retourner null si la dictée n\'existe pas', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait inclure le meilleur score et le nombre de tentatives', async () => {
      // TODO: Implémenter avec mock de Prisma
    });
  });

  describe('recordDictationAttempt', () => {
    it('devrait enregistrer une tentative de dictée', async () => {
      // TODO: Implémenter avec mock de Prisma
      // const attempt = {
      //   dictationId: 'dict1',
      //   profileId: 'profile1',
      //   score: 85,
      //   accuracy: 0.85,
      //   wordsCorrect: 17,
      //   wordsTotal: 20,
      //   errors: [],
      // };
      // const mockCreated = {
      //   id: 'attempt1',
      //   ...attempt,
      //   completedAt: new Date(),
      // };
      // (prisma.dictationAttempt.create as jest.Mock).mockResolvedValue(mockCreated);
      // const result = await recordDictationAttempt(attempt);
      // expect(result).toBeDefined();
      // expect(result.score).toBe(85);
    });

    it('devrait mettre à jour la progression après une tentative', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait débloquer la dictée suivante si le score est suffisant', async () => {
      // TODO: Implémenter avec mock de Prisma
    });
  });
});

