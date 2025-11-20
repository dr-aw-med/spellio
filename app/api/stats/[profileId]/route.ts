import { NextRequest, NextResponse } from 'next/server';
import {
  getProfileStats,
  getChildDashboardOverview,
  getDictationHistory,
} from '@/lib/services/statsService';

interface RouteParams {
  params: {
    profileId: string;
  };
}

/**
 * GET /api/stats/[profileId]
 * Récupère les statistiques complètes d'un profil
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { profileId } = params;
    const { searchParams } = new URL(request.url);

    // Récupérer les paramètres de requête
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const level = searchParams.get('level') || undefined;
    const type = searchParams.get('type') || 'full'; // 'full', 'overview', 'history'

    // Vérifier que le profileId est fourni
    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId est requis' },
        { status: 400 }
      );
    }

    // Récupérer les données selon le type demandé
    let data;
    switch (type) {
      case 'overview':
        data = await getChildDashboardOverview(profileId);
        break;
      case 'history':
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        data = await getDictationHistory(profileId, limit);
        break;
      case 'full':
      default:
        data = await getProfileStats({
          profileId,
          startDate,
          endDate,
          level,
        });
        break;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

