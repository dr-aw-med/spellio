/**
 * Utilitaire de compression d'images côté client.
 * Redimensionne et compresse en JPEG via Canvas pour limiter
 * la taille des données envoyées au backend.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

interface CompressedImage {
  base64: string;
  mimeType: string;
}

export const compressImage = async (
  file: File,
  maxSize = 1200,
  quality = 0.7
): Promise<CompressedImage> => {
  // Validation du type (accepter HEIC/HEIF des iPhones)
  const validTypes = ['image/', 'application/octet-stream'];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp'];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = validTypes.some(t => file.type.startsWith(t)) || file.type === '';
  const isValidExt = validExtensions.includes(ext);

  if (!isValidType && !isValidExt) {
    throw new Error('Le fichier sélectionné n\'est pas une image.');
  }

  // Validation de la taille
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `L'image est trop volumineuse (${sizeMB} Mo). La taille maximale est de 10 Mo.`
    );
  }

  // Charger l'image dans un élément HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Impossible de lire cette image.'));
    image.src = URL.createObjectURL(file);
  });

  // Calculer les dimensions en conservant le ratio
  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    } else {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  // Dessiner sur un canvas et compresser en JPEG
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  // Libérer l'object URL utilisée pour charger l'image
  URL.revokeObjectURL(img.src);

  // Convertir en base64 JPEG
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1];

  return {
    base64,
    mimeType: 'image/jpeg',
  };
};
