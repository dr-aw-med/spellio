/**
 * Service d'extraction de texte depuis différents formats de fichiers
 */

import { FileFormat, TextExtractionResult } from '@/types/import';
import mammoth from 'mammoth';

// Import dynamique de pdfjs-dist pour éviter les problèmes avec Next.js
let pdfjsLib: any = null;

async function getPdfJs() {
  if (typeof window === 'undefined') {
    // Côté serveur, on ne peut pas utiliser pdfjs-dist directement
    throw new Error('L\'extraction PDF n\'est pas disponible côté serveur');
  }

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Configuration du worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  return pdfjsLib;
}

export class TextExtractor {
  /**
   * Extrait le texte d'un fichier selon son format
   */
  static async extractText(
    file: File
  ): Promise<TextExtractionResult> {
    const format = this.getFileFormat(file);
    const extractedAt = new Date();

    let text = '';
    let metadata: TextExtractionResult['metadata'] = {
      wordCount: 0,
    };

    try {
      switch (format) {
        case 'txt':
        case 'md':
          const textResult = await this.extractFromText(file);
          text = textResult.text;
          metadata = textResult.metadata;
          break;

        case 'docx':
          const docxResult = await this.extractFromDocx(file);
          text = docxResult.text;
          metadata = docxResult.metadata;
          break;

        case 'pdf':
          const pdfResult = await this.extractFromPdf(file);
          text = pdfResult.text;
          metadata = pdfResult.metadata;
          break;

        case 'jpg':
        case 'jpeg':
        case 'png':
          // Pour les images, on suppose qu'elles seront traitées par OCR
          throw new Error('Les images doivent être traitées via le service OCR');

        default:
          throw new Error(`Format de fichier non supporté: ${format}`);
      }

      // Compter les mots
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      metadata.wordCount = wordCount;

      return {
        text,
        metadata,
        format,
        extractedAt,
      };
    } catch (error) {
      console.error('Erreur lors de l\'extraction de texte:', error);
      throw new Error(
        `Impossible d'extraire le texte du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Extrait le texte d'un fichier texte (.txt, .md)
   */
  private static async extractFromText(
    file: File
  ): Promise<{ text: string; metadata: TextExtractionResult['metadata'] }> {
    const text = await file.text();

    // Essayer d'extraire des métadonnées basiques
    const lines = text.split('\n');
    let title: string | undefined;
    let author: string | undefined;

    // Chercher un titre dans les premières lignes (format Markdown ou simple)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ')) {
        title = line.substring(2).trim();
        break;
      }
      if (line.startsWith('Title:') || line.startsWith('Titre:')) {
        title = line.split(':')[1]?.trim();
        break;
      }
    }

    // Chercher un auteur
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('Author:') || line.startsWith('Auteur:')) {
        author = line.split(':')[1]?.trim();
        break;
      }
    }

    return {
      text: text.trim(),
      metadata: {
        title,
        author,
        wordCount: 0, // Sera calculé plus tard
      },
    };
  }

  /**
   * Extrait le texte d'un fichier DOCX
   */
  private static async extractFromDocx(
    file: File
  ): Promise<{ text: string; metadata: TextExtractionResult['metadata'] }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      // Essayer d'extraire les métadonnées
      const metadataResult = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();

      // Extraction basique de métadonnées depuis le texte
      const lines = text.split('\n');
      let title: string | undefined;
      let author: string | undefined;

      // Chercher un titre dans les premières lignes
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length > 0 && line.length < 100 && !title) {
          title = line;
          break;
        }
      }

      return {
        text,
        metadata: {
          title,
          author,
          wordCount: 0,
        },
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'extraction DOCX: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Extrait le texte d'un fichier PDF
   */
  private static async extractFromPdf(
    file: File
  ): Promise<{ text: string; metadata: TextExtractionResult['metadata'] }> {
    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      const textParts: string[] = [];

      // Extraire le texte de chaque page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        textParts.push(pageText);
      }

      const text = textParts.join('\n\n').trim();

      // Extraire les métadonnées du PDF
      const metadata = await pdf.getMetadata();
      const title = metadata.info?.Title;
      const author = metadata.info?.Author;

      return {
        text,
        metadata: {
          title,
          author,
          pageCount: numPages,
          wordCount: 0,
        },
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'extraction PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Détermine le format d'un fichier
   */
  static getFileFormat(file: File): FileFormat {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // Vérifier d'abord par extension
    if (extension === 'txt') return 'txt';
    if (extension === 'md' || extension === 'markdown') return 'md';
    if (extension === 'docx') return 'docx';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
    if (extension === 'png') return 'png';

    // Vérifier par MIME type
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('text/markdown')) return 'md';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
    if (mimeType.includes('application/pdf')) return 'pdf';
    if (mimeType.includes('image/jpeg')) return 'jpg';
    if (mimeType.includes('image/png')) return 'png';

    // Par défaut, essayer de deviner depuis l'extension
    if (extension) {
      return extension as FileFormat;
    }

    throw new Error('Format de fichier non reconnu');
  }

  /**
   * Vérifie si un format de fichier est supporté
   */
  static isFormatSupported(format: string): boolean {
    const supportedFormats: FileFormat[] = ['txt', 'md', 'docx', 'pdf', 'jpg', 'jpeg', 'png'];
    return supportedFormats.includes(format as FileFormat);
  }

  /**
   * Valide qu'un fichier peut être traité
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Vérifier la taille (max 50 MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Fichier trop volumineux (maximum 50 MB)',
      };
    }

    // Vérifier le format
    try {
      const format = this.getFileFormat(file);
      if (!this.isFormatSupported(format)) {
        return {
          isValid: false,
          error: `Format de fichier non supporté: ${format}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Format de fichier non reconnu',
      };
    }

    return { isValid: true };
  }
}

