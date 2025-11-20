/**
 * API Route pour créer une dictée depuis un texte importé
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateDictationFromTextInput } from '@/types/import';
import { TextSegmentation } from '@/lib/import/textSegmentation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      text,
      mode,
      source,
      level,
      category,
      difficulty,
      description,
      fileId,
      profileId,
    } = body as CreateDictationFromTextInput;

    // Valider les champs requis
    if (!title || !text || !mode || !source || !level || !category || !difficulty) {
      return NextResponse.json(
        {
          error: 'Champs manquants',
          required: ['title', 'text', 'mode', 'source', 'level', 'category', 'difficulty'],
        },
        { status: 400 }
      );
    }

    // Normaliser le texte
    const normalizedText = TextSegmentation.normalizeForDictation(text);

    // Segmenter le texte pour obtenir les statistiques
    const segmentation = TextSegmentation.segmentText(normalizedText);

    // Créer la dictée selon le mode
    let dictationText: string;
    if (mode === 'word-by-word') {
      const words = TextSegmentation.createWordByWordDictation(normalizedText);
      dictationText = words.join(' ');
    } else {
      dictationText = TextSegmentation.createFullTextDictation(normalizedText);
    }

    // Estimer la durée
    const estimatedDuration = TextSegmentation.estimateDuration(segmentation.totalWords);

    // TODO: Sauvegarder dans la base de données via Prisma
    // Pour l'instant, on retourne juste la structure de la dictée créée
    const dictation = {
      id: `dict-${Date.now()}`, // ID temporaire
      title,
      text: dictationText,
      originalText: normalizedText,
      mode,
      source,
      level,
      category,
      difficulty,
      description,
      wordCount: segmentation.totalWords,
      sentenceCount: segmentation.totalSentences,
      estimatedDuration,
      fileId,
      profileId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      dictation,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la dictée:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de la dictée',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

