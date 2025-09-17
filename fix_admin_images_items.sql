-- Создаем функцию для обновления URL изображений предметов
CREATE OR REPLACE FUNCTION update_item_image_urls()
RETURNS void AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Обновляем URL изображений в таблице admin_shop_items
    FOR item_record IN SELECT id, image_url FROM admin_shop_items WHERE image_url IS NOT NULL AND image_url != '' LOOP
        -- Если URL не содержит полный путь к Supabase Storage, обновляем его
        IF item_record.image_url NOT LIKE 'https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/%' THEN
            UPDATE admin_shop_items 
            SET image_url = 'https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/admin-images/' || 
                            CASE 
                                WHEN item_record.image_url LIKE '/%' THEN substring(item_record.image_url FROM 2)
                                ELSE item_record.image_url
                            END
            WHERE id = item_record.id;
        END IF;
    END LOOP;
    
    -- Обновляем URL изображений в таблице equipment
    FOR item_record IN SELECT id, item_data FROM equipment WHERE item_data->>'image_url' IS NOT NULL AND item_data->>'image_url' != '' LOOP
        -- Если URL в JSON не содержит полный путь к Supabase Storage, обновляем его
        IF item_record.item_data->>'image_url' NOT LIKE 'https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/%' THEN
            UPDATE equipment 
            SET item_data = jsonb_set(
                item_data, 
                '{image_url}', 
                to_jsonb('https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/admin-images/' || 
                        CASE 
                            WHEN item_record.item_data->>'image_url' LIKE '/%' THEN substring(item_record.item_data->>'image_url' FROM 2)
                            ELSE item_record.item_data->>'image_url'
                        END)
            )
            WHERE id = item_record.id;
        END IF;
    END LOOP;
    
    -- Обновляем URL изображений в таблице player_inventory
    FOR item_record IN SELECT id, item_data FROM player_inventory WHERE item_data->>'image_url' IS NOT NULL AND item_data->>'image_url' != '' LOOP
        -- Если URL в JSON не содержит полный путь к Supabase Storage, обновляем его
        IF item_record.item_data->>'image_url' NOT LIKE 'https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/%' THEN
            UPDATE player_inventory 
            SET item_data = jsonb_set(
                item_data, 
                '{image_url}', 
                to_jsonb('https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/admin-images/' || 
                        CASE 
                            WHEN item_record.item_data->>'image_url' LIKE '/%' THEN substring(item_record.item_data->>'image_url' FROM 2)
                            ELSE item_record.item_data->>'image_url'
                        END)
            )
            WHERE id = item_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Выполняем обновление URL изображений
SELECT update_item_image_urls();

-- Проверяем результаты
SELECT id, name, image_url FROM admin_shop_items WHERE image_url IS NOT NULL AND image_url != '' LIMIT 10;
SELECT id, item_data->>'name' as name, item_data->>'image_url' as image_url FROM equipment WHERE item_data->>'image_url' IS NOT NULL AND item_data->>'image_url' != '' LIMIT 10;
SELECT id, item_data->>'name' as name, item_data->>'image_url' as image_url FROM player_inventory WHERE item_data->>'image_url' IS NOT NULL AND item_data->>'image_url' != '' LIMIT 10;