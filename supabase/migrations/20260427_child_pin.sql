-- Ajout du code PIN élève (4 chiffres, unique)
ALTER TABLE children ADD COLUMN IF NOT EXISTS pin TEXT;

-- Générer des PINs pour les enfants existants
DO $$
DECLARE
  child_record RECORD;
  new_pin TEXT;
BEGIN
  FOR child_record IN SELECT id FROM children WHERE pin IS NULL LOOP
    LOOP
      new_pin := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM children WHERE pin = new_pin);
    END LOOP;
    UPDATE children SET pin = new_pin WHERE id = child_record.id;
  END LOOP;
END $$;

-- Contrainte unique
ALTER TABLE children ADD CONSTRAINT children_pin_unique UNIQUE (pin);

-- Permettre la lecture par PIN sans auth (pour le mode élève)
CREATE POLICY "children_read_by_pin" ON children
  FOR SELECT
  USING (pin IS NOT NULL AND deleted_at IS NULL);
