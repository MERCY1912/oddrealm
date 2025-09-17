-- Проверяем текущие данные в таблице equipment
SELECT 
  id,
  player_id,
  slot,
  item_data->>'name' as item_name,
  item_data->>'image_url' as image_url
FROM equipment 
WHERE item_data->>'image_url' IS NOT NULL AND item_data->>'image_url' != '';

-- Обновляем URL изображений в таблице equipment, если они не содержат полный путь
UPDATE equipment
SET item_data = jsonb_set(
  item_data, 
  '{image_url}', 
  to_jsonb('https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/admin-images/' || 
          CASE 
              WHEN item_data->>'image_url' LIKE '/%' THEN substring(item_data->>'image_url' FROM 2)
              ELSE item_data->>'image_url'
          END)
)
WHERE item_data->>'image_url' IS NOT NULL 
  AND item_data->>'image_url' != ''
  AND item_data->>'image_url' NOT LIKE 'https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/%';

-- Проверяем результаты обновления
SELECT 
  id,
  player_id,
  slot,
  item_data->>'name' as item_name,
  item_data->>'image_url' as image_url
FROM equipment 
WHERE item_data->>'name' = 'Величие холодной стали';