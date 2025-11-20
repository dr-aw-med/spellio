/**
 * Composant de liste des dictées importées
 */

'use client';

import { ImportedDictation, ImportSource, ImportMode } from '@/types/import';

interface ImportedDictationsListProps {
  dictations: ImportedDictation[];
  onEdit?: (dictation: ImportedDictation) => void;
  onDelete?: (id: string) => void;
  onSelect?: (dictation: ImportedDictation) => void;
}

export function ImportedDictationsList({
  dictations,
  onEdit,
  onDelete,
  onSelect,
}: ImportedDictationsListProps) {
  const getSourceLabel = (source: ImportSource): string => {
    switch (source) {
      case 'photo':
        return '📷 Photo';
      case 'file':
        return '📄 Fichier';
      case 'text':
        return '✏️ Texte';
      default:
        return source;
    }
  };

  const getModeLabel = (mode: ImportMode): string => {
    return mode === 'word-by-word' ? 'Mot par mot' : 'Texte complet';
  };

  if (dictations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune dictée importée pour le moment.</p>
        <p className="text-sm mt-2">Importez une photo ou un fichier pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Dictées importées ({dictations.length})</h3>
      <div className="grid gap-4">
        {dictations.map((dictation) => (
          <div
            key={dictation.id}
            className="border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{dictation.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    {getSourceLabel(dictation.source)} • {getModeLabel(dictation.mode)}
                  </div>
                  <div>
                    Créée le {new Date(dictation.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="mt-2 text-gray-500 line-clamp-2">
                    {dictation.text.substring(0, 150)}
                    {dictation.text.length > 150 && '...'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {onSelect && (
                  <button
                    onClick={() => onSelect(dictation)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Utiliser
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(dictation)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    Modifier
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(dictation.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

