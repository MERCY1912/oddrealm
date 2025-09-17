import { supabase } from '@/integrations/supabase/client';

/**
 * Удаляет неиспользуемые изображения из Supabase Storage
 */
export const cleanupUnusedImages = async () => {
  try {
    console.log('Starting cleanup of unused images...');
    
    // Получаем все изображения из admin-images bucket
    const { data: allFiles, error: listError } = await supabase.storage
      .from('admin-images')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      return;
    }

    console.log(`Found ${allFiles?.length || 0} files in admin-images bucket`);

    // Получаем все используемые image_url из базы данных
    const { data: usedImages, error: dbError } = await supabase
      .from('admin_shop_items')
      .select('image_url')
      .not('image_url', 'is', null);

    if (dbError) {
      console.error('Error fetching used images:', dbError);
      return;
    }

    const usedImageUrls = new Set(usedImages?.map(item => item.image_url) || []);
    console.log(`Found ${usedImageUrls.size} used images in database`);

    // Находим неиспользуемые файлы
    const unusedFiles = allFiles?.filter(file => {
      const fileUrl = `https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/admin-images/${file.name}`;
      return !usedImageUrls.has(fileUrl);
    }) || [];

    console.log(`Found ${unusedFiles.length} unused files`);

    // Удаляем неиспользуемые файлы
    let deletedCount = 0;
    for (const file of unusedFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from('admin-images')
          .remove([file.name]);

        if (deleteError) {
          console.error(`Error deleting file ${file.name}:`, deleteError);
        } else {
          console.log(`Deleted unused file: ${file.name}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting file ${file.name}:`, error);
      }
    }

    console.log(`Cleanup completed. Deleted ${deletedCount} unused files.`);
    return { deletedCount, totalFiles: allFiles?.length || 0, unusedFiles: unusedFiles.length };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return null;
  }
};

/**
 * Получает статистику использования изображений
 */
export const getStorageStats = async () => {
  try {
    // Получаем все файлы
    const { data: allFiles, error: listError } = await supabase.storage
      .from('admin-images')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      return null;
    }

    // Получаем используемые изображения
    const { data: usedImages, error: dbError } = await supabase
      .from('admin_shop_items')
      .select('image_url, name')
      .not('image_url', 'is', null);

    if (dbError) {
      console.error('Error fetching used images:', dbError);
      return null;
    }

    return {
      totalFiles: allFiles?.length || 0,
      usedImages: usedImages?.length || 0,
      unusedFiles: (allFiles?.length || 0) - (usedImages?.length || 0),
      files: allFiles,
      usedImageUrls: usedImages
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};
