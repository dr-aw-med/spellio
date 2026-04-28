import { AppStep, UserRole } from '../types';

interface ModeSelectorProps {
  onSelect: (step: AppStep) => void;
  userRole: UserRole;
  onSignupPrompt: () => void;
}

export const ModeSelector = ({ onSelect, userRole, onSignupPrompt }: ModeSelectorProps) => {
  // TODO: server-side check when Stripe
  const isStoryLocked = userRole === 'STUDENT';

  return (
    <div className="w-full max-w-md mx-auto p-6 flex flex-col gap-6 animate-fade-in h-[80vh] justify-center">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">On s'entraîne comment ?</h2>

      <button
        onClick={() => onSelect(AppStep.DICTATION_WORD)}
        className="group relative bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-xl text-left"
      >
        <div className="absolute top-4 right-4 text-4xl group-hover:scale-110 transition-transform">🐢</div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">Mot à mot</h3>
        <p className="text-slate-500">Je te dicte les mots un par un. On prend notre temps.</p>
      </button>

      <button
        onClick={() => isStoryLocked ? onSignupPrompt() : onSelect(AppStep.DICTATION_STORY)}
        className={`group relative rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-lg text-left ${
          isStoryLocked
            ? 'bg-slate-100 hover:bg-slate-200 border-2 border-slate-200'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300'
        }`}
      >
        <div className="absolute top-4 right-4 text-4xl group-hover:scale-110 transition-transform">
          {isStoryLocked ? '🔒' : '📚'}
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isStoryLocked ? 'text-slate-600' : 'text-white'}`}>
          Histoire magique
        </h3>
        <p className={isStoryLocked ? 'text-slate-400' : 'text-indigo-100'}>
          J'invente une histoire avec tes mots pour une vraie dictée !
        </p>
        {isStoryLocked && (
          <span className="inline-block mt-3 text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
            Gratuit avec un compte
          </span>
        )}
      </button>
    </div>
  );
};
