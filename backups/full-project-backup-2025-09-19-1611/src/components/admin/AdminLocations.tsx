
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminLocation } from "@/types/admin";

const defaultImage = "/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png";

const locationsOrder = [
  "merchant", "blacksmith", "healer", "arena", "castle", "tavern", "temple", "ancient-tower",
];

const AdminLocations = () => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminLocation>>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    setInitialLoading(true);
    const { data, error } = await supabase
      .from("admin_locations")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
      setLocations([]);
    } else if (data && data.length > 0) {
      // Не фильтруем по order — показываем все локации, только сортируем знакомыми id
      const ordered = [
        ...locationsOrder
          .map((key) => data.find((l) => l.location_id === key))
          .filter(Boolean) as AdminLocation[],
        ...data.filter(l => !locationsOrder.includes(l.location_id)),
      ];
      setLocations(ordered);
    } else {
      setLocations([]);
    }
    setLoading(false);
    setInitialLoading(false);
  };

  const onEditLocation = (location: AdminLocation) => {
    setForm(location);
    setEditing(location.id);
  };

  const onCancelEdit = () => {
    setEditing(null);
    setForm({});
  };

  const onSave = async () => {
    if (!editing) return;
    setLoading(true);
    const { error } = await supabase
      .from("admin_locations")
      .update({
        name: form.name,
        description: form.description,
        background_gradient: form.background_gradient,
        image_url: form.image_url,
      })
      .eq("id", editing);
    setLoading(false);
    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Успех", description: "Локация обновлена!" });
      setEditing(null);
      fetchLocations();
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileName = `location-${form.location_id || "tmp"}-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });
    if (data) {
      const publicUrl = `/storage/v1/object/public/avatars/${fileName}`;
      setForm({ ...form, image_url: publicUrl });
    }
    if (error) {
      toast({
        title: "Ошибка загрузки файла",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
        🏛️ Управление локациями
      </div>
      {initialLoading ? (
        <div className="flex justify-center items-center h-32 text-yellow-400">Загрузка...</div>
      ) : locations.length === 0 ? (
        <div className="flex justify-center items-center h-32 text-gray-400">Пока нет локаций</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="bg-gray-800 border-gray-700 text-white relative">
            <CardHeader>
              <CardTitle>
                {editing === location.id ? (
                  <input
                    className="bg-gray-700 p-1 rounded w-full text-yellow-300 font-bold"
                    value={form.name ?? ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <span className="text-yellow-300 font-bold">{location.name}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                {/* Картинка большого размера */}
                <img
                  src={
                    editing === location.id
                      ? form.image_url || defaultImage
                      : location.image_url || defaultImage
                  }
                  alt={location.name}
                  className="w-full max-w-5xl h-[32rem] object-cover rounded-xl ring-4 ring-yellow-600 shadow-2xl bg-slate-900 mb-3"
                />
                {editing === location.id && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="mb-2"
                  />
                )}
                <div className="w-full mb-3">
                  {editing === location.id ? (
                    <textarea
                      className="bg-gray-700 p-1 rounded w-full min-h-[64px] text-gray-200"
                      value={form.description ?? ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Описание локации"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">{location.description}</div>
                  )}
                </div>
                <div className="w-full">
                  {editing === location.id ? (
                    <input
                      className="bg-gray-700 p-1 rounded w-full mb-2 text-blue-200"
                      value={form.background_gradient ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, background_gradient: e.target.value })
                      }
                      placeholder="Градиент фона (например: bg-gradient-to-b from-slate-800 to-slate-900)"
                    />
                  ) : (
                    <div className="text-blue-400 text-xs">{location.background_gradient}</div>
                  )}
                </div>
                {editing === location.id ? (
                  <div className="flex gap-3 mt-2">
                    <Button
                      onClick={onSave}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Сохранить
                    </Button>
                    <Button onClick={onCancelEdit} variant="outline">
                      Отмена
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => onEditLocation(location)}
                    className="bg-yellow-600 hover:bg-yellow-700 mt-3"
                  >
                    Редактировать
                  </Button>
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

export default AdminLocations;
