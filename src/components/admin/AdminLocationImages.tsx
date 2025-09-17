
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Upload, RefreshCw } from 'lucide-react';

const defaultImage = "/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png";

type AdminLocation = {
  id: string;
  location_id: string;
  name: string;
  description: string;
  image_url: string;
  background_gradient: string;
};

const AdminLocationImages = () => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    console.log('Fetching locations...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_locations")
        .select("*")
        .order("created_at", { ascending: true });
      
      console.log('Locations response:', { data, error });
      
      if (error) {
        console.error('Error fetching locations:', error);
        toast({ 
          title: "Ошибка загрузки", 
          description: error.message, 
          variant: "destructive" 
        });
        setLocations([]);
      } else if (data && data.length > 0) {
        console.log('Setting locations:', data);
        setLocations(data);
      } else {
        console.log('No locations found');
        // Создаем базовые локации если их нет
        await createDefaultLocations();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultLocations = async () => {
    const defaultLocations = [
      {
        location_id: 'town',
        name: 'Город',
        description: 'Центральная локация с магазинами и НПС',
        image_url: defaultImage,
        background_gradient: 'from-blue-800 to-blue-600'
      },
      {
        location_id: 'forest',
        name: 'Лес',
        description: 'Темный лес полный опасностей',
        image_url: defaultImage,
        background_gradient: 'from-green-800 to-green-600'
      },
      {
        location_id: 'dungeon',
        name: 'Подземелье',
        description: 'Мрачные катакомбы',
        image_url: defaultImage,
        background_gradient: 'from-gray-800 to-gray-600'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('admin_locations')
        .insert(defaultLocations)
        .select();

      if (error) {
        console.error('Error creating default locations:', error);
      } else {
        console.log('Created default locations:', data);
        setLocations(data || []);
      }
    } catch (err) {
      console.error('Error creating default locations:', err);
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>, locationId: string) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    setUploading(locationId);
    
    try {
      const fileName = `location-${location.location_id}-${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from("location-images")
        .upload(fileName, file, { upsert: true });
      
      if (data) {
        const publicUrl = `https://ygzkvsagmnhumcfwcsfm.supabase.co/storage/v1/object/public/location-images/${fileName}`;
        
        const { error: updateError } = await supabase
          .from("admin_locations")
          .update({ image_url: publicUrl })
          .eq("id", locationId);
        
        if (!updateError) {
          toast({ 
            title: "Картинка обновлена!", 
            description: `Изображение для ${location.name} успешно изменено.` 
          });
          fetchLocations();
        } else {
          toast({ 
            title: "Ошибка обновления", 
            description: updateError.message, 
            variant: "destructive" 
          });
        }
      }
      
      if (error) {
        console.error('Storage error:', error);
        toast({ 
          title: "Ошибка загрузки файла", 
          description: error.message, 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast({ 
        title: "Ошибка загрузки", 
        description: "Произошла ошибка при загрузке файла", 
        variant: "destructive" 
      });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold text-yellow-400">🏛️ Управление картинками локаций</div>
        <Button 
          onClick={fetchLocations} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32 text-yellow-400">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Загрузка локаций...
        </div>
      ) : locations.length === 0 ? (
        <div className="flex justify-center items-center h-32 text-gray-400">
          <div className="text-center">
            <p>Локации не найдены</p>
            <Button onClick={fetchLocations} className="mt-2 bg-blue-600 hover:bg-blue-700">
              Создать базовые локации
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-300 font-bold">{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <img
                    src={location.image_url || defaultImage}
                    alt={location.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      console.log('Image load error for:', location.name);
                      e.currentTarget.src = defaultImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onImageChange(e, location.id)}
                        className="hidden"
                        disabled={uploading === location.id}
                      />
                      <div className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <Upload className="h-4 w-4" />
                        {uploading === location.id ? "Загрузка..." : "Изменить"}
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  ID: {location.location_id}
                </div>
                
                {location.description && (
                  <div className="text-sm text-gray-300">
                    {location.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLocationImages;
