/**
 * API Route pour le traitement et l'extraction de texte depuis des fichiers
 */

import { NextRequest, NextResponse } from 'next/server';
import { TextExtractor } from '@/lib/import/textExtractor';
import { FileParser } from '@/lib/import/fileParser';
import { ImportMode } from '@/types/import';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = (formData.get('mode') as ImportMode) || 'word-by-word';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Valider le fichier
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Fichier invalide',
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Parser le fichier
    const preview = await FileParser.parseFile(file, mode);

    // Suggérer des métadonnées
    const metadata = FileParser.suggestMetadata(preview.extractedText);
    const suggestedTitle = FileParser.suggestTitle(preview.extractedText, file.name);

    return NextResponse.json({
      success: true,
      preview: {
        ...preview,
        suggestedTitle,
        suggestedMetadata: metadata,
      },
    });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement du fichier',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

