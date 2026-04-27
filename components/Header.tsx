import { UserRole } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onHome: () => void;
  userRole: UserRole;
}

export const Header = ({ onLogout, onHome, userRole }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-10">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={userRole ? onHome : undefined}
        role="button"
        title="Retour a l'accueil"
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform group-hover:rotate-12 duration-300">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.1" />
            <path d="M35 25 Q65 25 75 50 Q65 75 35 75 L35 25 Z" fill="url(#logoGradient)" />
            <path d="M45 40 L45 60 M55 35 L55 65 M65 45 L65 55" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 tracking-tight">
          Spellio
        </h1>
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
            Deconnexion
          </button>
        </div>
      )}
    </header>
  );
};
