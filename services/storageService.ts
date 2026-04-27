import { supabase } from "./supabaseClient";
import { Dictation } from "../types";

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

export const saveDictation = async (
  title: string,
  words: string[]
): Promise<Dictation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifie');

  const code = generateCode();
  const cleanWords = words.filter(w => w.trim() !== '');

  const { data, error } = await supabase
    .from('dictations')
    .insert({
      code,
      title: title || `Dictee du ${new Date().toLocaleDateString('fr-FR')}`,
      words: cleanWords,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur creation dictee:', error);
    throw new Error('Impossible de creer la dictee');
  }

  return data as Dictation;
};

export const getAllDictations = async (): Promise<Dictation[]> => {
  // RLS filtre automatiquement par user_id pour les users authentifies
  const { data, error } = await supabase
    .from('dictations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur recuperation dictees:', error);
    return [];
  }

  return (data || []) as Dictation[];
};

export const getDictationByCode = async (code: string): Promise<Dictation | null> => {
  const { data, error } = await supabase
    .from('dictations')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single();

  if (error) return null;
  return data as Dictation;
};

export const deleteDictation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dictations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur suppression dictee:', error);
    return false;
  }
  return true;
};
