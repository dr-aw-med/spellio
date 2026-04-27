import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'success' | 'warning' | 'info';
}

const variantConfig = {
  success: {
    icon: '🎉',
    bg: 'bg-green-50',
    border: 'border-green-200',
    buttonBg: 'bg-green-500 hover:bg-green-600 shadow-green-200',
    iconBg: 'bg-green-100',
  },
  warning: {
    icon: '🤔',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    iconBg: 'bg-amber-100',
  },
  info: {
    icon: '💡',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200',
    iconBg: 'bg-indigo-100',
  },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Oui',
  cancelText = 'Non',
  variant = 'info',
}) => {
  const config = variantConfig[variant];
  const isConfirmMode = !!onConfirm;

  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop semi-transparent avec flou */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Carte modale */}
      <div
        className={`
          relative w-full max-w-sm
          bg-white rounded-3xl shadow-2xl
          border ${config.border}
          p-8 text-center
          animate-[modalIn_250ms_ease-out]
        `}
      >
        {/* Icone */}
        <div className={`
          w-20 h-20 mx-auto mb-5 rounded-full
          ${config.iconBg}
          flex items-center justify-center
        `}>
          <span className="text-5xl" role="img" aria-hidden="true">
            {config.icon}
          </span>
        </div>

        {/* Titre */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {title}
        </h2>

        {/* Message optionnel */}
        {message && (
          <p className="text-slate-500 text-base mb-6 leading-relaxed">
            {message}
          </p>
        )}

        {/* Boutons */}
        <div className={`
          flex gap-3 mt-6
          ${isConfirmMode ? 'justify-center' : 'justify-center'}
        `}>
          {isConfirmMode ? (
            <>
              <button
                onClick={onClose}
                className="
                  px-6 py-3 rounded-2xl font-semibold text-base
                  bg-white text-slate-600 border-2 border-slate-200
                  hover:border-slate-300 hover:bg-slate-50
                  transition-all duration-200
                  active:scale-95
                  min-w-[100px]
                "
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`
                  px-6 py-3 rounded-2xl font-semibold text-base
                  text-white shadow-md
                  ${config.buttonBg}
                  transition-all duration-200
                  active:scale-95
                  min-w-[100px]
                `}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`
                px-8 py-3 rounded-2xl font-semibold text-base
                text-white shadow-md
                ${config.buttonBg}
                transition-all duration-200
                active:scale-95
                min-w-[120px]
              `}
            >
              OK
            </button>
          )}
        </div>
      </div>

      {/* Animations CSS via style tag inline */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
