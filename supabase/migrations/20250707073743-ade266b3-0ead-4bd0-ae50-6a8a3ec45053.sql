-- Fix equipment slot constraint to include shield
DROP CONSTRAINT IF EXISTS equipment_slot_check ON equipment;
ALTER TABLE equipment ADD CONSTRAINT equipment_slot_check CHECK (slot IN ('weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'necklace', 'ring1', 'ring2', 'ring3', 'shield', 'leggings', 'bracers', 'earring'));