import { supabase } from '@/integrations/supabase/client';

export interface StorageImage {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

/**
 * Получает все изображения из указанного Supabase Storage bucket
 */
export const getImagesFromStorage = async (bucketName: string): Promise<StorageImage[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error(`Error fetching images from bucket ${bucketName}:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Фильтруем только изображения и создаем полные URL
    const images: StorageImage[] = data
      .filter(file => {
        const fileName = file.name?.toLowerCase() || '';
        return fileName.endsWith('.png') || 
               fileName.endsWith('.jpg') || 
               fileName.endsWith('.jpeg') || 
               fileName.endsWith('.gif') || 
               fileName.endsWith('.webp');
      })
      .map(file => ({
        id: file.id || file.name,
        name: file.name,
        url: `https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/${bucketName}/${file.name}`,
        created_at: file.created_at || new Date().toISOString()
      }));

    return images;
  } catch (error) {
    console.error(`Unexpected error fetching images from bucket ${bucketName}:`, error);
    return [];
  }
};

/**
 * Получает изображения героев из bucket 'avatars'
 */
export const getHeroImages = async (): Promise<StorageImage[]> => {
  return getImagesFromStorage('avatars');
};

/**
 * Получает изображения локаций из bucket 'location-images'
 */
export const getLocationImages = async (): Promise<StorageImage[]> => {
  return getImagesFromStorage('location-images');
};

/**
 * Получает изображения админ-панели из bucket 'admin-images'
 */
export const getAdminImages = async (): Promise<StorageImage[]> => {
  return getImagesFromStorage('admin-images');
};

/**
 * Получает изображения предметов из bucket 'admin-images'
 */
export const getItemImages = async (): Promise<StorageImage[]> => {
  return getImagesFromStorage('admin-images');
};

/**
 * Формирует правильный URL для изображения предмета из Supabase Storage
 */
export const getItemImageUrl = (imageName: string, bucketName: string = 'admin-images'): string => {
  return `https://soblxtzltnziynrvasaw.supabase.co/storage/v1/object/public/${bucketName}/${imageName}`;
};

/**
 * Проверяет и исправляет URL изображения предмета
 */
export const normalizeItemImageUrl = (imageUrl: string | undefined): string | undefined => {
  console.log('normalizeItemImageUrl - Input:', imageUrl);
  
  if (!imageUrl) {
    console.log('normalizeItemImageUrl - No image URL provided');
    return undefined;
  }
  
  // Если URL уже содержит полный путь к Supabase Storage, возвращаем как есть
  if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
    console.log('normalizeItemImageUrl - URL already contains full Supabase path:', imageUrl);
    return imageUrl;
  }
  
  // Если URL начинается с /, удаляем его
  if (imageUrl.startsWith('/')) {
    console.log('normalizeItemImageUrl - Removing leading slash from URL');
    imageUrl = imageUrl.substring(1);
  }
  
  // Формируем полный URL для admin-images bucket
  const normalizedUrl = getItemImageUrl(imageUrl, 'admin-images');
  console.log('normalizeItemImageUrl - Normalized URL:', normalizedUrl);
  return normalizedUrl;
};

