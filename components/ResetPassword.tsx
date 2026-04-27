import { useState } from 'react';
import { Button } from './Button';
import { updatePassword } from '../services/authService';

interface ResetPasswordProps {
  onDone: () => void;
}

export const ResetPassword = ({ onDone }: ResetPasswordProps) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-2xl font-bold text-slate-800">Nouveau mot de passe</h2>
          <p className="text-slate-500 mt-1">Choisis un nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="6 caractères minimum"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Retape le mot de passe"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-xl">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full">
            Enregistrer
          </Button>
        </form>
      </div>
    </div>
  );
};
