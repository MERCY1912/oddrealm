import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateCryptoId } from '@/utils/browserUtils';
import AdminShopForm from './shop/AdminShopForm';
import AdminShopList from './shop/AdminShopList';
import { AdminShopItem, ItemFormData } from '@/types/admin';

const initialFormData: ItemFormData = {
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

const AdminShop = () => {
  const [items, setItems] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<AdminShopItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
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
      setItems((data as unknown as AdminShopItem[]) || []);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `shop-items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
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
        console.log('AdminShop: Uploading new image file:', imageFile.name);
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          console.log('AdminShop: Image upload failed, continuing without image');
          return;
        } else {
          console.log('AdminShop: Image uploaded successfully:', imageUrl);
        }
      } else {
        console.log('AdminShop: No new image file selected, keeping existing:', imageUrl);
      }

      const itemData = {
        ...formData,
        item_id: formData.item_id || generateCryptoId(),
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

  const handleEdit = (item: AdminShopItem) => {
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

  const handleStatChange = (statName: keyof ItemFormData['stats'], value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: parseInt(value) || 0,
      },
    }));
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminShopForm
        formData={formData}
        setFormData={setFormData}
        handleStatChange={handleStatChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        editingItem={editingItem}
        setImageFile={setImageFile}
      />
      <AdminShopList
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminShop;
