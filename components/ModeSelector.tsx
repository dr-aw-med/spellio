import { useState } from 'react';
import { AppStep, UserRole } from '../types';
import { Turtle, BookOpen, Lock, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { createCheckoutSession } from '../services/stripeService';

interface ModeSelectorProps {
  onSelect: (step: AppStep) => void;
  userRole: UserRole;
  onSignupPrompt: () => void;
  hasActiveChild?: boolean;
  isPremium?: boolean;
}

export const ModeSelector = ({ onSelect, userRole, onSignupPrompt, hasActiveChild, isPremium }: ModeSelectorProps) => {
  const isStoryLocked = userRole === 'STUDENT' && !hasActiveChild && !isPremium;
  const showUpgrade = (userRole === 'PARENT' || userRole === 'TEACHER') && !isPremium;
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setIsLoadingCheckout(true);
    try {
      const url = await createCheckoutSession(plan);
      window.location.href = url;
    } catch (err) {
      console.error('Erreur checkout:', err);
      setIsLoadingCheckout(false);
    }
  };

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
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md shadow-sky-200 group-hover:scale-110 transition-transform text-white">
          <Turtle size={24} />
        </div>
        <h3 className="text-xl font-bold text-sky-800 mb-2">Mot à mot</h3>
        <p className="text-slate-500 text-sm leading-relaxed">Je te dicte les mots un par un. On prend notre temps.</p>
      </button>

      <button
        onClick={() => {
          if (isStoryLocked) onSignupPrompt();
          else if (showUpgrade) {/* On affiche les options d'upgrade en dessous */}
          else onSelect(AppStep.DICTATION_STORY);
        }}
        className={`animate-fade-in-up group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 text-left ${
          isStoryLocked || showUpgrade
            ? 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-violet-400 hover:shadow-xl shadow-lg shadow-violet-200'
        }`}
        style={{ animationDelay: '220ms' }}
      >
        <div className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${
          isStoryLocked || showUpgrade ? 'bg-slate-200 text-slate-400' : 'bg-white/20 text-white'
        }`}>
          {isStoryLocked || showUpgrade ? <Lock size={24} /> : <BookOpen size={24} />}
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isStoryLocked || showUpgrade ? 'text-slate-500' : 'text-white'}`}>
          Histoire magique
        </h3>
        <p className={`text-sm leading-relaxed ${isStoryLocked || showUpgrade ? 'text-slate-400' : 'text-violet-100'}`}>
          J'invente une histoire avec tes mots pour une vraie dictée !
        </p>
        {isStoryLocked && (
          <span className="inline-block mt-3 text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full">
            Gratuit avec un compte
          </span>
        )}
        {showUpgrade && (
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold bg-violet-100 text-violet-600 px-3 py-1.5 rounded-full">
            <Sparkles size={12} /> Premium
          </span>
        )}
      </button>

      {/* Options d'upgrade pour les comptes parent/enseignant non premium */}
      {showUpgrade && (
        <div className="bg-white rounded-2xl border border-violet-100 p-5 animate-fade-in">
          <div className="text-center mb-4">
            <Sparkles size={20} className="text-violet-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Débloquer l'Histoire Magique</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={isLoadingCheckout}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 hover:border-violet-400 transition-all"
            >
              <span className="text-2xl font-extrabold text-slate-800">3,99€</span>
              <span className="text-xs text-slate-400">/mois</span>
            </button>
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={isLoadingCheckout}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-violet-400 bg-violet-50 hover:bg-violet-100 transition-all relative"
            >
              <span className="absolute -top-2 right-2 text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">-17%</span>
              <span className="text-2xl font-extrabold text-violet-700">39,90€</span>
              <span className="text-xs text-violet-400">/an</span>
            </button>
          </div>
          {isLoadingCheckout && (
            <p className="text-xs text-slate-400 text-center mt-3 animate-pulse">Redirection vers le paiement...</p>
          )}
        </div>
      )}
    </div>
  );
};
