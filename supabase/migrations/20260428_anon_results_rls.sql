-- Permettre aux élèves connectés via PIN (rôle anon) d'insérer des résultats
-- Sécurité : le child_id doit exister et ne pas être supprimé
CREATE POLICY "anon_insert_results"
  ON results FOR INSERT TO anon
  WITH CHECK (
    child_id IN (SELECT id FROM children WHERE deleted_at IS NULL AND pin IS NOT NULL)
  );

-- Permettre aux élèves via PIN de lire leurs propres résultats
CREATE POLICY "anon_select_results"
  ON results FOR SELECT TO anon
  USING (
    child_id IN (SELECT id FROM children WHERE deleted_at IS NULL AND pin IS NOT NULL)
  );
