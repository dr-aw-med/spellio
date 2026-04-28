import { AppStep, UserRole } from '../types';

interface ModeSelectorProps {
  onSelect: (step: AppStep) => void;
  userRole: UserRole;
  onSignupPrompt: () => void;
}

export const ModeSelector = ({ onSelect, userRole, onSignupPrompt }: ModeSelectorProps) => {
  const isStoryLocked = userRole === 'STUDENT';

  return (
    <div className="w-full max-w-md mx-auto p-6 flex flex-col gap-6 h-[80vh] justify-center">
      <div className="text-center mb-2 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">On s'entraîne comment ?</h2>
        <p className="text-slate-400 mt-1">Choisis ton mode de dictée</p>
      </div>

      <button
        onClick={() => onSelect(AppStep.DICTATION_WORD)}
        className="animate-fade-in-up group relative bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 hover:border-sky-400 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left"
        style={{ animationDelay: '100ms' }}
      >
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md shadow-sky-200 group-hover:scale-110 transition-transform">
          <span className="text-2xl">🐢</span>
        </div>
        <h3 className="text-xl font-bold text-sky-800 mb-2">Mot à mot</h3>
        <p className="text-slate-500 text-sm leading-relaxed">Je te dicte les mots un par un. On prend notre temps.</p>
      </button>

      <button
        onClick={() => isStoryLocked ? onSignupPrompt() : onSelect(AppStep.DICTATION_STORY)}
        className={`animate-fade-in-up group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 text-left ${
          isStoryLocked
            ? 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-violet-400 hover:shadow-xl shadow-lg shadow-violet-200'
        }`}
        style={{ animationDelay: '220ms' }}
      >
        <div className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${
          isStoryLocked ? 'bg-slate-200' : 'bg-white/20'
        }`}>
          <span className="text-2xl">{isStoryLocked ? '🔒' : '📚'}</span>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isStoryLocked ? 'text-slate-500' : 'text-white'}`}>
          Histoire magique
        </h3>
        <p className={`text-sm leading-relaxed ${isStoryLocked ? 'text-slate-400' : 'text-violet-100'}`}>
          J'invente une histoire avec tes mots pour une vraie dictée !
        </p>
        {isStoryLocked && (
          <span className="inline-block mt-3 text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full">
            Gratuit avec un compte
          </span>
        )}
      </button>
    </div>
  );
};
