/**
 * API Route pour une dictée spécifique
 * GET /api/dictations/[id] - Récupérer une dictée par ID
 * PUT /api/dictations/[id] - Mettre à jour une dictée (admin)
 * DELETE /api/dictations/[id] - Supprimer une dictée (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getDictationById,
  updateDictation,
  deleteDictation,
} from "@/lib/services/dictationService";
import { UpdateDictationInput } from "@/types/dictation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId") || undefined;

    const dictation = await getDictationById(params.id, profileId);

    if (!dictation) {
      return NextResponse.json(
        {
          success: false,
          error: "Dictée non trouvée",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dictation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la dictée:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de la dictée",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Vérifier l'authentification et les permissions admin
    // const session = await getServerSession();
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: "Non autorisé" },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const input: UpdateDictationInput = {
      title: body.title,
      text: body.text,
      level: body.level,
      category: body.category,
      difficulty: body.difficulty,
      description: body.description,
      estimatedDuration: body.estimatedDuration,
    };

    const dictation = await updateDictation(params.id, input);

    if (!dictation) {
      return NextResponse.json(
        {
          success: false,
          error: "Dictée non trouvée",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dictation,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la dictée:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour de la dictée",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Vérifier l'authentification et les permissions admin
    // const session = await getServerSession();
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: "Non autorisé" },
    //     { status: 403 }
    //   );
    // }

    const success = await deleteDictation(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la suppression de la dictée",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dictée supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la dictée:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression de la dictée",
      },
      { status: 500 }
    );
  }
}

