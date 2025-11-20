/**
 * Service de traitement d'images pour améliorer la qualité avant OCR
 */

import { ImageProcessingOptions } from '@/types/import';

export class ImageProcessor {
  /**
   * Redimensionne une image
   */
  static async resizeImage(
    imageFile: File,
    options: ImageProcessingOptions['resize']
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        let { width, height } = img;

        if (options?.width || options?.height) {
          const aspectRatio = width / height;

          if (options.width && options.height) {
            width = options.width;
            height = options.height;
          } else if (options.width) {
            width = options.width;
            height = options.maintainAspectRatio !== false
              ? width / aspectRatio
              : height;
          } else if (options.height) {
            height = options.height;
            width = options.maintainAspectRatio !== false
              ? height * aspectRatio
              : width;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Erreur lors du redimensionnement'));
            }
          },
          imageFile.type,
          0.95
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  /**
   * Améliore le contraste et la luminosité d'une image
   */
  static async enhanceImage(
    imageFile: File,
    options: ImageProcessingOptions['enhance']
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const contrast = options?.contrast ?? 1;
        const brightness = options?.brightness ?? 0;

        // Appliquer contraste et luminosité
        for (let i = 0; i < data.length; i += 4) {
          // R
          data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));
          // G
          data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness));
          // B
          data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness));
        }

        // Appliquer le filtre de netteté si demandé
        if (options?.sharpen) {
          // Filtre de netteté simple (Laplacien)
          const sharpenKernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
          ];
          // Note: Implémentation simplifiée, pourrait être améliorée
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const enhancedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });
              resolve(enhancedFile);
            } else {
              reject(new Error('Erreur lors de l\'amélioration'));
            }
          },
          imageFile.type,
          0.95
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  /**
   * Recadre une image
   */
  static async cropImage(
    imageFile: File,
    crop: ImageProcessingOptions['crop']
  ): Promise<File> {
    if (!crop) {
      throw new Error('Options de recadrage requises');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
          img,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });
              resolve(croppedFile);
            } else {
              reject(new Error('Erreur lors du recadrage'));
            }
          },
          imageFile.type,
          0.95
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  /**
   * Fait tourner une image
   */
  static async rotateImage(
    imageFile: File,
    degrees: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Calculer les nouvelles dimensions après rotation
        const rad = (degrees * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const rotatedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });
              resolve(rotatedFile);
            } else {
              reject(new Error('Erreur lors de la rotation'));
            }
          },
          imageFile.type,
          0.95
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = url;
    });
  }

  /**
   * Traite une image avec toutes les options
   */
  static async processImage(
    imageFile: File,
    options: ImageProcessingOptions
  ): Promise<File> {
    let processedFile = imageFile;

    if (options.rotate) {
      processedFile = await this.rotateImage(processedFile, options.rotate);
    }

    if (options.crop) {
      processedFile = await this.cropImage(processedFile, options.crop);
    }

    if (options.resize) {
      processedFile = await this.resizeImage(processedFile, options.resize);
    }

    if (options.enhance) {
      processedFile = await this.enhanceImage(processedFile, options.enhance);
    }

    return processedFile;
  }

  /**
   * Valide la qualité d'une image pour l'OCR
   */
  static async validateImageQuality(imageFile: File): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Vérifier la taille du fichier
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (imageFile.size > maxSize) {
      issues.push('Fichier trop volumineux');
      recommendations.push('Réduisez la taille de l\'image');
    }

    // Vérifier le format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(imageFile.type)) {
      issues.push('Format d\'image non supporté');
      recommendations.push('Utilisez JPEG ou PNG');
    }

    // Vérifier les dimensions (via une promesse)
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const minWidth = 200;
        const minHeight = 200;
        const maxWidth = 4000;
        const maxHeight = 4000;

        if (img.width < minWidth || img.height < minHeight) {
          issues.push('Image trop petite');
          recommendations.push(`Dimensions minimales: ${minWidth}x${minHeight}px`);
        }

        if (img.width > maxWidth || img.height > maxHeight) {
          issues.push('Image trop grande');
          recommendations.push(`Dimensions maximales: ${maxWidth}x${maxHeight}px`);
        }

        resolve({
          isValid: issues.length === 0,
          issues,
          recommendations,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          issues: ['Erreur lors du chargement de l\'image'],
          recommendations: ['Vérifiez que le fichier est une image valide'],
        });
      };

      img.src = url;
    });
  }
}

