/**
 * Tests unitaires pour le service de statistiques
 */

import {
  getProfileStats,
  getParentDashboard,
  getDictationHistory,
} from '@/lib/services/statsService';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    dictationResult: {
      findMany: jest.fn(),
    },
    profile: {
      findMany: jest.fn(),
    },
  },
}));

describe('statsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileStats', () => {
    it('devrait retourner les statistiques complètes d\'un profil', async () => {
      // TODO: Implémenter avec mock de Prisma
      // const mockResults = [
      //   {
      //     id: '1',
      //     profileId: 'profile1',
      //     dictationId: 'dict1',
      //     score: 90,
      //     accuracy: 0.9,
      //     status: 'completed',
      //     timeSpent: 300,
      //     completedAt: new Date(),
      //     dictation: {
      //       title: 'Dictée CP',
      //       level: { name: 'CP' },
      //     },
      //   },
      // ];
      // (prisma.dictationResult.findMany as jest.Mock).mockResolvedValue(mockResults);
      // const result = await getProfileStats({ profileId: 'profile1' });
      // expect(result).toBeDefined();
      // expect(result.totalDictations).toBe(1);
      // expect(result.averageScore).toBe(90);
    });

    it('devrait filtrer par dates si fournies', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait filtrer par niveau si fourni', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait calculer la moyenne des scores', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait calculer le temps total passé', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait analyser les erreurs', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait retourner la progression par niveau', async () => {
      // TODO: Implémenter avec mock de Prisma
    });
  });

  describe('getParentDashboard', () => {
    it('devrait retourner le tableau de bord parent avec tous les enfants', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait inclure les statistiques pour chaque enfant', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait calculer les statistiques globales', async () => {
      // TODO: Implémenter avec mock de Prisma
    });
  });

  describe('getDictationHistory', () => {
    it('devrait retourner l\'historique des dictées d\'un profil', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait limiter le nombre de résultats', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait trier par date de complétion décroissante', async () => {
      // TODO: Implémenter avec mock de Prisma
    });

    it('devrait inclure les informations de la dictée', async () => {
      // TODO: Implémenter avec mock de Prisma
    });
  });
});

