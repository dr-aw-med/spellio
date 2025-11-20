/**
 * API Route pour le traitement OCR d'images
 */

import { NextRequest, NextResponse } from 'next/server';
import { OCRService } from '@/lib/ocr/ocrService';
import { ImageProcessor } from '@/lib/ocr/imageProcessing';
import { OCRProcessingOptions, ImageProcessingOptions } from '@/types/import';

export const runtime = 'nodejs'; // ou 'edge' selon vos besoins

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Valider le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Valider la qualité de l'image
    const validation = await ImageProcessor.validateImageQuality(file);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Image invalide',
          issues: validation.issues,
          recommendations: validation.recommendations,
        },
        { status: 400 }
      );
    }

    // Récupérer les options depuis le formData
    const language = formData.get('language') as string || 'fra';
    const enhanceContrast = formData.get('enhanceContrast') === 'true';
    const enhanceBrightness = formData.get('enhanceBrightness') === 'true';

    // Traiter l'image si nécessaire
    let processedFile = file;
    if (enhanceContrast || enhanceBrightness) {
      const imageProcessingOptions: ImageProcessingOptions = {
        enhance: {
          contrast: enhanceContrast ? 1.2 : undefined,
          brightness: enhanceBrightness ? 0.1 : undefined,
          sharpen: true,
        },
      };
      processedFile = await ImageProcessor.processImage(file, imageProcessingOptions);
    }

    // Configurer les options OCR
    const ocrOptions: OCRProcessingOptions = {
      language: language as 'fra' | 'eng' | 'spa',
    };

    // Effectuer la reconnaissance OCR
    const result = await OCRService.processImage(processedFile, ocrOptions);

    // Normaliser le texte
    result.text = OCRService.normalizeText(result.text);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Erreur lors du traitement OCR:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement OCR',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

