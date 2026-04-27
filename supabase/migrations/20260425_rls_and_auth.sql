-- Active RLS sur la table dictations
ALTER TABLE dictations ENABLE ROW LEVEL SECURITY;

-- Les enseignants authentifies peuvent voir uniquement leurs propres dictees
CREATE POLICY "teachers_select_own"
  ON dictations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les enseignants authentifies peuvent creer des dictees (user_id = leur id)
CREATE POLICY "teachers_insert_own"
  ON dictations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Les enseignants authentifies peuvent supprimer leurs propres dictees
CREATE POLICY "teachers_delete_own"
  ON dictations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Les utilisateurs anonymes (eleves) peuvent lire les dictees par code
-- Cela permet le flow "code dictee" sans compte
CREATE POLICY "students_select_by_code"
  ON dictations FOR SELECT
  TO anon
  USING (true);
  -- Note : le filtrage par code se fait dans le query (.eq('code', code))
  -- On autorise la lecture pour tous les anon car les dictees ne contiennent
  -- pas de donnees sensibles (juste des mots)
