import { supabase } from './supabaseClient';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  role: 'TEACHER' | 'PARENT' | null;
  firstName: string | null;
}

export async function signUp(
  email: string,
  password: string,
  role: 'TEACHER' | 'PARENT',
  firstName?: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, first_name: firstName || null },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Erreur lors de la création du compte');

  return {
    id: data.user.id,
    email: data.user.email!,
    role,
    firstName: firstName || null,
  };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login')) {
      throw new Error('Email ou mot de passe incorrect');
    }
    throw new Error(error.message);
  }

  const meta = data.user.user_metadata;
  let role = meta?.role || null;

  // Compte ancien sans rôle : on le corrige en PARENT par défaut
  if (!role) {
    role = 'PARENT';
    await supabase.auth.updateUser({
      data: { role, first_name: meta?.first_name || null },
    });
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    role,
    firstName: meta?.first_name || null,
  };
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

