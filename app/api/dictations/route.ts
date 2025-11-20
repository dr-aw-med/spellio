/**
 * API Route pour la gestion des dictées
 * GET /api/dictations - Liste des dictées avec filtres
 * POST /api/dictations - Créer une nouvelle dictée (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getDictations,
  createDictation,
} from "@/lib/services/dictationService";
import {
  DictationFilters,
  CreateDictationInput,
  SchoolLevel,
  DictationCategory,
  Difficulty,
} from "@/types/dictation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: DictationFilters = {};

    const level = searchParams.get("level");
    if (level && Object.values(SchoolLevel).includes(level as SchoolLevel)) {
      filters.level = level as SchoolLevel;
    }

    const category = searchParams.get("category");
    if (
      category &&
      Object.values(DictationCategory).includes(category as DictationCategory)
    ) {
      filters.category = category as DictationCategory;
    }

    const difficulty = searchParams.get("difficulty");
    if (
      difficulty &&
      Object.values(Difficulty).includes(difficulty as Difficulty)
    ) {
      filters.difficulty = difficulty as Difficulty;
    }

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    const unlockedOnly = searchParams.get("unlockedOnly") === "true";
    if (unlockedOnly) {
      filters.unlockedOnly = true;
    }

    const profileId = searchParams.get("profileId") || undefined;

    const dictations = await getDictations(filters, profileId);

    return NextResponse.json({
      success: true,
      data: dictations,
      count: dictations.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des dictées:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des dictées",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const input: CreateDictationInput = {
      title: body.title,
      text: body.text,
      level: body.level,
      category: body.category,
      difficulty: body.difficulty,
      description: body.description,
      estimatedDuration: body.estimatedDuration,
    };

    // Validation basique
    if (!input.title || !input.text || !input.level || !input.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Champs requis manquants: title, text, level, category",
        },
        { status: 400 }
      );
    }

    const dictation = await createDictation(input);

    return NextResponse.json(
      {
        success: true,
        data: dictation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la dictée:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de la dictée",
      },
      { status: 500 }
    );
  }
}

