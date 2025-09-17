import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateCryptoId } from '@/utils/browserUtils';
import { cleanupUnusedImages, getStorageStats } from '@/utils/cleanupStorage';
import AdminShopFormV2 from './shop/AdminShopFormV2';
import AdminShopListV2 from './shop/AdminShopListV2';
import { AdminShopItemV2, ItemFormDataV2 } from '@/types/admin';

const initialFormData: ItemFormDataV2 = {
  item_id: '',
  name: '',
  type: 'weapon',
  weaponType: 'sword',
  rarity: 'common',
  stats: {
    attack: 0,
    defense: 0,
    health: 0,
    mana: 0,
    criticalChance: 0,
    antiCriticalChance: 0,
    dodgeChance: 0,
    antiDodgeChance: 0,
    strength: 0,
    dexterity: 0,
    luck: 0,
    endurance: 0,
    magic: 0,
    bodyArmor: 0,
    legArmor: 0,
    armArmor: 0,
    headArmor: 0,
    vampirism: 0,
    blockChance: 0,
  },
  price: 0,
  description: '',
  requirements: '',
  is_active: true,
};

const AdminShopV2 = () => {
  const [items, setItems] = useState<AdminShopItemV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<AdminShopItemV2 | null>(null);
  const [formData, setFormData] = useState<ItemFormDataV2>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_shop_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data as unknown as AdminShopItemV2[]) || []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить предметы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Проверяем права пользователя
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Проверяем роль администратора
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      console.log('Role check result:', roleData, roleError);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      // Используем admin-images bucket, так как для него уже настроены политики
      const { error: uploadError } = await supabase.storage
        .from('admin-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('admin-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить изображение: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = editingItem?.image_url;
      
      // Загружаем изображение только если выбран новый файл
      if (imageFile) {
        console.log('AdminShopV2: Uploading new image file:', imageFile.name);
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          // Если загрузка изображения не удалась, продолжаем без изображения
          toast({
            title: "Предупреждение",
            description: "Предмет будет создан без изображения",
            variant: "destructive",
          });
        } else {
          console.log('AdminShopV2: Image uploaded successfully:', imageUrl);
        }
      } else {
        console.log('AdminShopV2: No new image file selected, keeping existing:', imageUrl);
      }

      // Создаем объект данных для базы данных, исключая поля формы
      const itemData = {
        item_id: formData.item_id || generateCryptoId(),
        name: formData.name,
        type: formData.type,
        rarity: formData.rarity,
        stats: formData.stats,
        price: formData.price,
        description: formData.description,
        requirements: formData.requirements,
        is_active: formData.is_active,
        image_url: imageUrl,
        weapon_type: formData.type === 'weapon' ? formData.weaponType : null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('admin_shop_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Предмет обновлен",
        });
      } else {
        const { error } = await supabase
          .from('admin_shop_items')
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Предмет создан",
        });
      }

      handleCancel();
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить предмет",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: AdminShopItemV2) => {
    setEditingItem(item);
    setFormData({
      item_id: item.item_id,
      name: item.name,
      type: item.type,
      weaponType: item.weapon_type || 'sword',
      rarity: item.rarity,
      stats: {
        attack: item.stats.attack || 0,
        defense: item.stats.defense || 0,
        health: item.stats.health || 0,
        mana: item.stats.mana || 0,
        criticalChance: item.stats.criticalChance || 0,
        antiCriticalChance: item.stats.antiCriticalChance || 0,
        dodgeChance: item.stats.dodgeChance || 0,
        antiDodgeChance: item.stats.antiDodgeChance || 0,
        strength: item.stats.strength || 0,
        dexterity: item.stats.dexterity || 0,
        luck: item.stats.luck || 0,
        endurance: item.stats.endurance || 0,
        magic: item.stats.magic || 0,
        bodyArmor: item.stats.bodyArmor || 0,
        legArmor: item.stats.legArmor || 0,
        armArmor: item.stats.armArmor || 0,
        headArmor: item.stats.headArmor || 0,
        vampirism: item.stats.vampirism || 0,
        blockChance: item.stats.blockChance || 0,
      },
      price: item.price,
      description: item.description || '',
      requirements: item.requirements || '',
      is_active: item.is_active,
    });
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить предмет?')) return;

    try {
      const { error } = await supabase
        .from('admin_shop_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Предмет удален",
      });
      
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить предмет",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setImageFile(null);
  };

  const handleStatChange = (statName: keyof ItemFormDataV2['stats'], value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: parseInt(value) || 0,
      },
    }));
  };

  const handleCleanupImages = async () => {
    if (!confirm('Удалить все неиспользуемые изображения? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const result = await cleanupUnusedImages();
      if (result) {
        toast({
          title: "Очистка завершена",
          description: `Удалено ${result.deletedCount} неиспользуемых файлов из ${result.totalFiles} общих файлов`,
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Ошибка очистки",
        description: "Не удалось очистить неиспользуемые изображения",
        variant: "destructive",
      });
    }
  };

  const handleShowStats = async () => {
    try {
      const stats = await getStorageStats();
      if (stats) {
        toast({
          title: "Статистика Storage",
          description: `Всего файлов: ${stats.totalFiles}, Используется: ${stats.usedImages}, Неиспользуемых: ${stats.unusedFiles}`,
        });
        console.log('Storage stats:', stats);
      }
    } catch (error) {
      console.error('Error getting stats:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить статистику",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Кнопки управления Storage */}
      <div className="flex gap-4 p-4 bg-gray-800 rounded-lg">
        <button
          onClick={handleShowStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          📊 Показать статистику Storage
        </button>
        <button
          onClick={handleCleanupImages}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          🗑️ Очистить неиспользуемые изображения
        </button>
      </div>

      <AdminShopFormV2
        formData={formData}
        setFormData={setFormData}
        handleStatChange={handleStatChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        editingItem={editingItem}
        setImageFile={setImageFile}
      />
      <AdminShopListV2
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminShopV2;
