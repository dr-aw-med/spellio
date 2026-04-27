import { AppStep } from '../types';

interface ModeSelectorProps {
  onSelect: (step: AppStep) => void;
}

export const ModeSelector = ({ onSelect }: ModeSelectorProps) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 flex flex-col gap-6 animate-fade-in h-[80vh] justify-center">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">On s'entraine comment ?</h2>

      <button
        onClick={() => onSelect(AppStep.DICTATION_WORD)}
        className="group relative bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-xl text-left"
      >
        <div className="absolute top-4 right-4 text-4xl group-hover:scale-110 transition-transform">🐢</div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">Mot a mot</h3>
        <p className="text-slate-500">Je te dicte les mots un par un. On prend notre temps.</p>
      </button>

      <button
        onClick={() => onSelect(AppStep.DICTATION_STORY)}
        className="group relative bg-indigo-600 hover:bg-indigo-700 rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-300 text-left"
      >
        <div className="absolute top-4 right-4 text-4xl group-hover:scale-110 transition-transform">📚</div>
        <h3 className="text-xl font-bold text-white mb-2">Histoire magique</h3>
        <p className="text-indigo-100">J'invente une histoire avec tes mots pour une vraie dictee !</p>
      </button>
    </div>
  );
};
