import { UserRole } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onHome: () => void;
  onLogoClick: () => void;
  userRole: UserRole;
  showHome?: boolean;
  activeChildName?: string;
  onChildProfile?: () => void;
}

export const Header = ({ onLogout, onHome, onLogoClick, userRole, showHome = true, activeChildName, onChildProfile }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-10">
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={onLogoClick}
        role="button"
        title="Retour à l'accueil"
      >
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-full h-full transition-transform group-hover:scale-110 duration-300">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGrad)" />
            <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="Fredoka, sans-serif">S</text>
          </svg>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 tracking-tight">
          Spellio
        </span>
      </div>

      {userRole && (
        <div className="flex items-center gap-2">
          {activeChildName && (
            <button
              onClick={onChildProfile}
              className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100 hover:bg-pink-100 transition-colors"
              title="Mon profil"
            >
              {activeChildName}
            </button>
          )}

          {showHome && (
            <button
              onClick={onHome}
              className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
              title="Accueil"
            >
              <span className="text-base">🏠</span>
              <span className="hidden sm:inline">Accueil</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50 uppercase tracking-wide"
          >
            {userRole === 'STUDENT' ? 'Changer' : 'Déconnexion'}
          </button>
        </div>
      )}
    </header>
  );
};
