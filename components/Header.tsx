import { UserRole } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onHome: () => void;
  onLogoClick: () => void;
  userRole: UserRole;
}

export const Header = ({ onLogout, onHome, onLogoClick, userRole }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-10">
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
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGrad)" />
            <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="Fredoka, sans-serif">S</text>
          </svg>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 tracking-tight">
          Spellio
        </span>
      </div>

      {userRole && (
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
            title="Accueil"
          >
            <span className="text-lg">🏠</span>
            <span className="hidden sm:inline">Accueil</span>
          </button>
          <button
            onClick={onLogout}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-50 uppercase tracking-wide border border-transparent hover:border-slate-200"
          >
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
};
