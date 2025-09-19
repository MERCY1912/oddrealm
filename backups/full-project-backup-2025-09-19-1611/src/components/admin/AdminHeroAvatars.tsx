
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const defaultImage = "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png";

// Тип для строки admin_hero_avatars
type HeroAvatar = {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  created_at: string;
};

const AdminHeroAvatars = () => {
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
      const publicUrl = `/storage/v1/object/public/avatars/${fileName}`;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-yellow-400">🖼️ Образы героев</div>
      </div>
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Добавить новый образ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div>
              <input type="file" accept="image/*" onChange={onImageChange} disabled={uploading} />
              {form.image_url && (
                <img src={form.image_url} className="w-32 h-32 object-cover rounded shadow mt-2" />
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded text-white mb-1"
                placeholder="Название образа"
                value={form.title ?? ""}
                onChange={e => setForm({ ...form, title: e.target.value })}
                disabled={uploading}
              />
              <textarea
                className="bg-gray-700 px-2 py-1 rounded text-white mb-1"
                placeholder="Описание (необязательно)"
                value={form.description ?? ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
                disabled={uploading}
              />
              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 w-fit" disabled={loading || uploading}>
                Добавить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {avatars.map(a => (
          <Card className="bg-gray-800 border-gray-700" key={a.id}>
            <CardContent>
              <img src={a.image_url || defaultImage} className="w-28 h-28 object-cover rounded mx-auto mt-3" />
              <div className="text-center mt-2 font-bold text-yellow-200">{a.title}</div>
              <div className="text-xs text-gray-400 text-center">{a.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroAvatars;
