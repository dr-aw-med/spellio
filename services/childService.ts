import { supabase } from './supabaseClient';
import { Child, DictationResult } from '../types';

export async function getChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erreur chargement enfants:', error);
    return [];
  }
  return data as Child[];
}

const VALID_AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐸', '🐰', '🐻', '🦋', '🐧', '🐲'];

export async function createChild(
  firstName: string,
  avatar: string,
  schoolLevel: string
): Promise<Child> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const safeAvatar = VALID_AVATARS.includes(avatar) ? avatar : '🦊';

  const { data, error } = await supabase
    .from('children')
    .insert({
      parent_id: user.id,
      first_name: firstName,
      avatar,
      school_level: schoolLevel,
    })
    .select()
    .single();

  if (error) throw new Error('Impossible de créer le profil');
  return data as Child;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase
    .from('children')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Impossible de supprimer le profil');
}

export async function touchChild(id: string): Promise<void> {
  await supabase
    .from('children')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function saveResult(
  childId: string,
  dictationCode: string,
  dictationTitle: string,
  mode: 'word' | 'story',
  totalWords: number,
  mistakes: number
): Promise<DictationResult> {
  const score = Math.round(((totalWords - mistakes) / totalWords) * 100);

  const { data, error } = await supabase
    .from('results')
    .insert({
      child_id: childId,
      dictation_code: dictationCode,
      dictation_title: dictationTitle,
      mode,
      total_words: totalWords,
      mistakes,
      score,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur sauvegarde résultat:', error);
    throw new Error('Impossible de sauvegarder le résultat');
  }

  await touchChild(childId);
  return data as DictationResult;
}

export async function getChildResults(childId: string): Promise<DictationResult[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('child_id', childId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Erreur chargement résultats:', error);
    return [];
  }
  return data as DictationResult[];
}

export async function getChildStats(childId: string): Promise<{
  averageScore: number;
  totalDictations: number;
  lastDate: string | null;
}> {
  const results = await getChildResults(childId);

  if (results.length === 0) {
    return { averageScore: 0, totalDictations: 0, lastDate: null };
  }

  const averageScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length
  );

  return {
    averageScore,
    totalDictations: results.length,
    lastDate: results[0].completed_at,
  };
}
