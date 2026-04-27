import { useState } from 'react';
import { Button } from './Button';
import { signIn, signUp, resetPassword } from '../services/authService';

interface LoginScreenProps {
  onSelectRole: (role: 'STUDENT' | 'TEACHER') => void;
}

export const LoginScreen = ({ onSelectRole }: LoginScreenProps) => {
  const [showTeacherAuth, setShowTeacherAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTeacherAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs');
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onSelectRole('TEACHER');
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
      setSuccess('Email de reinitialisation envoye ! Verifie ta boite mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  if (showTeacherAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setShowTeacherAuth(false); setError(''); setSuccess(''); }}
            className="text-sm text-slate-400 hover:text-indigo-500 mb-6 flex items-center gap-1"
          >
            ← Retour
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🧑‍🏫</div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isSignUp ? 'Creer un compte' : 'Se connecter'}
            </h2>
            <p className="text-slate-500 mt-1">Espace enseignant</p>
          </div>

          <form onSubmit={handleTeacherAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="enseignant@ecole.fr"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder={isSignUp ? '6 caracteres minimum' : '••••••'}
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
              {isSignUp ? 'Creer mon compte' : 'Se connecter'}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6">
            {!isSignUp && (
              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="text-sm text-slate-400 hover:text-indigo-500 transition-colors"
              >
                Mot de passe oublie ?
              </button>
            )}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              className="text-sm text-indigo-500 hover:text-indigo-700 font-medium"
            >
              {isSignUp ? 'Deja un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">Qui es-tu ?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => onSelectRole('STUDENT')}
          className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-6xl mb-4 group-hover:animate-bounce">🎒</div>
          <h3 className="text-2xl font-bold text-indigo-900">Je suis un Eleve</h3>
          <p className="text-slate-500 mt-2 text-center">Je veux m'entrainer avec ma dictee.</p>
        </button>

        <button
          onClick={() => setShowTeacherAuth(true)}
          className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-6xl mb-4 group-hover:animate-bounce">🧑‍🏫</div>
          <h3 className="text-2xl font-bold text-indigo-900">Je suis Professeur</h3>
          <p className="text-slate-500 mt-2 text-center">Je veux creer et partager des dictees.</p>
        </button>
      </div>
    </div>
  );
};
