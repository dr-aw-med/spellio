-- ============================================
-- Spellio : Comptes Parent/Enfant
-- Tables children + results + RLS
-- ============================================

-- Table des profils enfant
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 50),
  avatar TEXT DEFAULT '🦊' CHECK (char_length(avatar) BETWEEN 1 AND 10),
  school_level TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_children_parent ON children(parent_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_manage_children"
  ON children FOR ALL TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Table des résultats de dictée
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  dictation_code TEXT NOT NULL,
  dictation_title TEXT DEFAULT '',
  mode TEXT NOT NULL CHECK (mode IN ('word', 'story')),
  total_words INT NOT NULL CHECK (total_words > 0),
  mistakes INT NOT NULL CHECK (mistakes >= 0),
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_results_child_date ON results(child_id, completed_at DESC);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_select_results"
  ON results FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "parents_insert_results"
  ON results FOR INSERT TO authenticated
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
