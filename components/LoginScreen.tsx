import { useState } from 'react';
import { Button } from './Button';
import { signIn, signUp, resetPassword } from '../services/authService';
import { Backpack, Users, GraduationCap, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onSelectRole: (role: 'STUDENT' | 'TEACHER' | 'PARENT', firstName?: string) => void;
}

const ROLE_CARDS = [
  {
    role: 'STUDENT' as const,
    icon: Backpack,
    title: 'Élève',
    desc: 'Je m\'entraîne avec ma dictée.',
    color: 'text-sky-500',
    hoverBorder: 'hover:border-sky-400',
    needsAuth: false,
  },
  {
    role: 'PARENT' as const,
    icon: Users,
    title: 'Parent',
    desc: 'Je suis les progrès de mes enfants.',
    color: 'text-pink-500',
    hoverBorder: 'hover:border-pink-400',
    needsAuth: true,
  },
  {
    role: 'TEACHER' as const,
    icon: GraduationCap,
    title: 'Enseignant',
    desc: 'Je crée et partage des dictées.',
    color: 'text-violet-500',
    hoverBorder: 'hover:border-violet-400',
    needsAuth: true,
  },
];

export const LoginScreen = ({ onSelectRole }: LoginScreenProps) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authIntent, setAuthIntent] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs');
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    if (isSignUp && authIntent === 'PARENT' && !firstName.trim()) {
      setError('Le prénom est obligatoire');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const role = authIntent;
        await signUp(email, password, role, role === 'PARENT' ? firstName : undefined);
        onSelectRole(role, role === 'PARENT' ? firstName : undefined);
      } else {
        const user = await signIn(email, password);
        if (!user.role) throw new Error('Compte sans rôle. Contactez le support.');
        const role = user.role;
        onSelectRole(role, user.firstName || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Entre ton email d\'abord');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Email de réinitialisation envoyé ! Vérifie ta boîte mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthForm = (intent: 'TEACHER' | 'PARENT') => {
    setAuthIntent(intent);
    setShowAuthForm(true);
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    setFirstName('');
    setError('');
    setSuccess('');
  };

  const currentCard = ROLE_CARDS.find(c => c.role === authIntent);

  if (showAuthForm) {
    const isParentSignUp = isSignUp && authIntent === 'PARENT';
    const AuthIcon = currentCard?.icon || Users;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setShowAuthForm(false); setError(''); setSuccess(''); }}
            className="text-sm text-slate-400 hover:text-indigo-500 mb-6 flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Retour
          </button>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl ${currentCard?.color} bg-slate-50 flex items-center justify-center mx-auto mb-4`}>
              <AuthIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-indigo-700">
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </h2>
            <p className="text-indigo-400 mt-1 font-medium">
              {authIntent === 'PARENT' ? 'Espace parent' : 'Espace enseignant'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isParentSignUp && (
              <div>
                <label className="block text-sm font-semibold text-indigo-400 mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 focus:outline-none transition-colors"
                  placeholder="Ton prénom"
                  autoComplete="given-name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-indigo-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 focus:outline-none transition-colors"
                placeholder={authIntent === 'PARENT' ? 'parent@email.fr' : 'enseignant@école.fr'}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-400 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 focus:outline-none transition-colors"
                placeholder={isSignUp ? '6 caractères minimum' : '••••••'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-xl">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded-xl">{success}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full"
            >
              {isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6">
            {!isSignUp && (
              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="text-sm text-slate-400 hover:text-indigo-500 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            )}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              className="text-sm text-indigo-500 hover:text-indigo-700 font-medium"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-4 sm:p-6">
      {/* Logo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="heroLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#heroLogoGrad)" />
          <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="Fredoka, sans-serif">S</text>
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 text-center">Qui es-tu ?</h2>
      <p className="text-slate-400 text-center mb-6 sm:mb-10 text-sm">Choisis pour commencer !</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-3xl">
        {ROLE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.role}
              onClick={() => card.needsAuth ? openAuthForm(card.role as 'TEACHER' | 'PARENT') : onSelectRole(card.role)}
              className={`flex flex-row sm:flex-col items-center gap-4 sm:gap-0 p-5 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 border-transparent ${card.hoverBorder} hover:shadow-xl transition-all duration-300 group text-left sm:text-center`}
            >
              <div className={`${card.color} sm:mb-4 shrink-0`}>
                <Icon size={40} strokeWidth={1.5} className="sm:w-12 sm:h-12" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-indigo-900">{card.title}</h3>
                <p className="text-slate-500 text-sm sm:mt-2">{card.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
