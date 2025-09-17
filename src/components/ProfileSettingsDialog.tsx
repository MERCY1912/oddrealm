import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlayerProfile } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onPlayerUpdate: (updates: Partial<PlayerProfile>) => void;
}

const ProfileSettingsDialog = ({ isOpen, onClose, player, onPlayerUpdate }: ProfileSettingsDialogProps) => {
  const [username, setUsername] = useState(player.username);
  const [description, setDescription] = useState(player.description || '');
  const [city, setCity] = useState(player.city || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(player.character_image_url || null);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Загрузка аватаров из Supabase Storage
  const loadAvatars = async () => {
    setLoadingAvatars(true);
    try {
      console.log('Loading avatars from Supabase Storage...');
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('', {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Error loading avatars:', error);
        toast({
          title: 'Ошибка загрузки образов',
          description: 'Не удалось загрузить доступные образы персонажей.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const avatarUrls = data.map(file => {
          const { data: publicUrl } = supabase.storage
            .from('avatars')
            .getPublicUrl(file.name);
          return publicUrl.publicUrl;
        });
        
        console.log('Loaded avatars:', avatarUrls);
        setAvatars(avatarUrls);
      }
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast({
        title: 'Ошибка загрузки образов',
        description: 'Произошла ошибка при загрузке образов персонажей.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAvatars(false);
    }
  };

  // Загрузка аватаров при открытии диалога
  useEffect(() => {
    if (isOpen) {
      setUsername(player.username);
      setDescription(player.description || '');
      setCity(player.city || '');
      setSelectedAvatar(player.character_image_url || null);
      loadAvatars();
    }
  }, [isOpen, player]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        username: username.trim(),
        description: description.trim(),
        city: city.trim(),
        character_image_url: selectedAvatar,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving profile updates:', updates);

      // Сохранение в базе данных
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', player.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      // Обновление локального состояния
      onPlayerUpdate(updates);

      toast({
        title: 'Успех',
        description: 'Настройки профиля сохранены.',
      });
      
      onClose();

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки профиля.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      // Проверяем совпадение паролей
      if (newPassword !== confirmPassword) {
        throw new Error('Новые пароли не совпадают');
      }

      // Проверяем длину пароля
      if (newPassword.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      // Обновляем пароль
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Пароль изменен',
        description: 'Ваш пароль успешно обновлен',
        variant: 'default',
      });

      // Очищаем форму
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    console.log('Avatar selected:', avatarUrl);
    setSelectedAvatar(avatarUrl);
  };

  console.log('ProfileSettingsDialog - Rendering with isOpen:', isOpen);
  console.log('ProfileSettingsDialog - Current selectedAvatar:', selectedAvatar);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="game-bg-secondary game-border game-text-primary max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="game-accent-red">Настройки профиля</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Основные настройки</TabsTrigger>
              <TabsTrigger value="appearance">Образы</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
            </TabsList>
            
            {/* Вкладка основных настроек */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Левая колонка */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-white font-medium">
                      Имя пользователя
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      placeholder="Введите имя пользователя"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-white font-medium">
                      Город
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      placeholder="Ваш город"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white font-medium">
                      О себе
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white min-h-[100px]"
                      placeholder="Расскажите немного о своем герое..."
                    />
                  </div>
                </div>

                {/* Правая колонка - текущий образ */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white font-medium">
                      Текущий образ персонажа
                    </Label>
                    <div className="mt-2 w-full h-48 bg-gray-700 border-2 border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {selectedAvatar ? (
                        <img
                          src={selectedAvatar}
                          alt="Current character"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-gray-400 text-center">Образ не найден</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl mb-2">👤</div>
                          <div>Образ не выбран</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Настройки темы */}
                  <div>
                    <Label className="text-white font-medium">
                      Тема интерфейса
                    </Label>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm text-gray-300">
                        Текущая тема: {theme === 'dark' ? '🌙 Темная' : '☀️ Светлая'}
                      </div>
                      <Button
                        onClick={toggleTheme}
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        {theme === 'dark' ? '☀️ Переключить на светлую' : '🌙 Переключить на темную'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Вкладка образов */}
            <TabsContent value="appearance" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium text-lg">
                    Выберите образ персонажа
                  </Label>
                  <div className="text-sm text-gray-400 mt-1">
                    Выберите изображение для вашего персонажа из доступных образов
                  </div>
                </div>

                {loadingAvatars ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Загрузка образов персонажей...</div>
                  </div>
                ) : avatars.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                    {avatars.map((avatarUrl, index) => (
                      <div
                        key={index}
                        onClick={() => handleAvatarSelect(avatarUrl)}
                        className={`
                          relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                          ${selectedAvatar === avatarUrl 
                            ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50' 
                            : 'border-gray-600 hover:border-gray-400'
                          }
                        `}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Character ${index + 1}`}
                          className="w-full h-24 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-24 bg-gray-600 flex items-center justify-center text-gray-400">Ошибка</div>';
                            }
                          }}
                        />
                        {selectedAvatar === avatarUrl && (
                          <div className="absolute top-1 right-1 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Образы персонажей не найдены</div>
                    <Button 
                      onClick={loadAvatars} 
                      variant="outline"
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      Попробовать снова
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Вкладка безопасности */}
            <TabsContent value="security" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium text-lg">
                    Смена пароля
                  </Label>
                  <div className="text-sm text-gray-400 mt-1">
                    Измените пароль для вашего аккаунта
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-white font-medium">
                      Текущий пароль
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-white font-medium">
                      Новый пароль
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-white font-medium">
                      Подтвердите новый пароль
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="game-accent-red hover:opacity-80"
                  >
                    {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="game-border game-text-primary hover:game-bg-tertiary">
              Отмена
            </Button>
          </DialogClose>
          <Button 
            onClick={() => {
              console.log('Test button clicked - selectedAvatar:', selectedAvatar);
              console.log('Test button clicked - player.character_image_url:', player.character_image_url);
              console.log('Test button clicked - username:', username);
              console.log('Test button clicked - city:', city);
              console.log('Test button clicked - description:', description);
            }}
            variant="outline"
            className="game-border game-text-primary hover:game-bg-tertiary"
          >
            Тест
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="game-accent-red hover:opacity-80"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;