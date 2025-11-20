import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { SessionUser } from '@/types/user';

/**
 * Récupère la session utilisateur côté serveur
 */
export async function getServerAuthSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    activeProfileId: session.user.activeProfileId || null,
  };
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getServerAuthSession();
  
  if (!session) {
    throw new Error('Non authentifié');
  }

  return session;
}

/**
 * Vérifie si l'utilisateur est un parent
 */
export async function requireParent(): Promise<SessionUser> {
  const session = await requireAuth();
  
  if (session.role !== 'PARENT') {
    throw new Error('Accès refusé. Réservé aux parents.');
  }

  return session;
}

