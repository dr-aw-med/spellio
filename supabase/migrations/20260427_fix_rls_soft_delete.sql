-- Fix RLS : filtrer les enfants soft-deleted

-- Remplacer la policy children
DROP POLICY IF EXISTS "parents_manage_children" ON children;

CREATE POLICY "parents_select_children"
  ON children FOR SELECT TO authenticated
  USING (parent_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "parents_insert_children"
  ON children FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "parents_update_children"
  ON children FOR UPDATE TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "parents_delete_children"
  ON children FOR DELETE TO authenticated
  USING (parent_id = auth.uid());

-- Fix la sous-requête results pour exclure les enfants supprimés
DROP POLICY IF EXISTS "parents_select_results" ON results;

CREATE POLICY "parents_select_results"
  ON results FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid() AND deleted_at IS NULL));

-- Index partiel pour optimiser les requêtes sur les enfants actifs
CREATE INDEX IF NOT EXISTS idx_children_active ON children(parent_id) WHERE deleted_at IS NULL;
