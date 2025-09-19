
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

const defaultImage = "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png";

type HeroAvatar = {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  created_at: string;
};

const AdminHeroAvatarsPage = () => {
  const [avatars, setAvatars] = useState<HeroAvatar[]>([]);
  const [form, setForm] = useState<{ image_url?: string; title?: string; description?: string }>({});
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAvatars(); }, []);

  const fetchAvatars = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_hero_avatars').select('*').order('created_at');
    if (error) toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    else setAvatars(data as HeroAvatar[]);
    setLoading(false);
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    const fileName = `hero-avatar-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });
    setUploading(false);
    if (data) {
      const publicUrl = `https://ygzkvsagmnhumcfwcsfm.supabase.co/storage/v1/object/public/avatars/${fileName}`;
      setForm({ ...form, image_url: publicUrl });
    }
    if (error) {
      toast({ title: "Ошибка загрузки файла", description: error.message, variant: "destructive" });
    }
  };

  const onSave = async () => {
    if (!form.image_url || !form.title) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("admin_hero_avatars").insert([{
      image_url: form.image_url,
      title: form.title,
      description: form.description || "",
    }]);
    setLoading(false);
    if (!error) {
      setForm({});
      fetchAvatars();
      toast({ title: "Образ добавлен!" });
    } else {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить этот образ?")) return;
    setLoading(true);
    const { error } = await supabase.from("admin_hero_avatars").delete().eq("id", id);
    setLoading(false);
    if (!error) {
      fetchAvatars();
      toast({ title: "Образ удален!" });
    } else {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold text-yellow-400">🖼️ Образы героев для выбора игроками</div>
      </div>
      
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Добавить новый образ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col">
              <input 
                type="file" 
                accept="image/*" 
                onChange={onImageChange} 
                disabled={uploading}
                className="mb-3 text-white" 
              />
              {form.image_url && (
                <img src={form.image_url} className="w-32 h-32 object-cover rounded shadow" alt="Preview" />
              )}
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <input
                type="text"
                className="bg-gray-700 px-3 py-2 rounded text-white"
                placeholder="Название образа"
                value={form.title ?? ""}
                onChange={e => setForm({ ...form, title: e.target.value })}
                disabled={uploading}
              />
              <textarea
                className="bg-gray-700 px-3 py-2 rounded text-white min-h-[80px]"
                placeholder="Описание образа (необязательно)"
                value={form.description ?? ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
                disabled={uploading}
              />
              <Button 
                onClick={onSave} 
                className="bg-green-600 hover:bg-green-700 w-fit" 
                disabled={loading || uploading}
              >
                {uploading ? "Загрузка..." : "Добавить образ"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-32 text-yellow-400">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {avatars.map(avatar => (
            <Card className="bg-gray-800 border-gray-700 relative" key={avatar.id}>
              <Button
                onClick={() => onDelete(avatar.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 z-10"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="p-4">
                <img 
                  src={avatar.image_url || defaultImage} 
                  className="w-full h-48 object-cover rounded-lg mb-3" 
                  alt={avatar.title}
                />
                <div className="text-center">
                  <div className="font-bold text-yellow-200 mb-1">{avatar.title}</div>
                  {avatar.description && (
                    <div className="text-xs text-gray-400">{avatar.description}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHeroAvatarsPage;
