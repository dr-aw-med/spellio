import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createCheckoutSession(plan: 'monthly' | 'yearly'): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const functionUrl = API_BASE
    ? `${API_BASE}/create-checkout`
    : `https://qzagjartyppewpbhjygg.supabase.co/functions/v1/create-checkout`;

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      plan,
      userId: user.id,
      email: user.email,
      returnUrl: window.location.origin,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la création du paiement');
  }

  const { url } = await res.json();
  return url;
}

export function isPremium(userMetadata: Record<string, unknown> | undefined): boolean {
  return userMetadata?.is_premium === true;
}
