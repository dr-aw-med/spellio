/**
 * Composant de sélection du mode de dictée (mot par mot ou texte complet)
 */

'use client';

import { ImportMode } from '@/types/import';

interface ModeSelectorProps {
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ mode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Mode de dictée
      </label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onModeChange('word-by-word')}
          disabled={disabled}
          className={`
            flex-1 p-4 border-2 rounded-lg transition-all
            ${mode === 'word-by-word'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="font-semibold mb-1">Mot par mot</div>
          <div className="text-xs text-gray-600">
            Chaque mot est dicté séparément, idéal pour les débutants
          </div>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('full-text')}
          disabled={disabled}
          className={`
            flex-1 p-4 border-2 rounded-lg transition-all
            ${mode === 'full-text'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="font-semibold mb-1">Texte complet</div>
          <div className="text-xs text-gray-600">
            Le texte complet est dicté d'un coup, pour les plus avancés
          </div>
        </button>
      </div>
    </div>
  );
}

