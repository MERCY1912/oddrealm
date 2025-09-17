import React, { useState } from 'react';
import OrnateFrame from './OrnateFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetProps {
  onBack: () => void;
}

const PasswordReset = ({ onBack }: PasswordResetProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Письмо отправлено',
        description: 'Проверьте вашу почту для восстановления пароля',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="medieval-title text-5xl medieval-accent-blood mb-2">
              ⚔️ КРОВАВЫЕ АРЕНЫ
            </h1>
            <p className="medieval-subtitle text-lg">
              Мир жестокости и темной магии
            </p>
          </div>

          <OrnateFrame title="ПИСЬМО ОТПРАВЛЕНО" tone="epic" corners={4} edges>
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">📧</div>
              <p className="medieval-text-primary">
                Мы отправили письмо с инструкциями по восстановлению пароля на адрес:
              </p>
              <p className="medieval-accent-gold font-bold">{email}</p>
              <p className="medieval-text-primary text-sm">
                Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
              </p>
              <Button
                onClick={onBack}
                className="w-full medieval-button bg-blood hover:bg-red-700 text-white font-bold text-lg py-3"
              >
                ВЕРНУТЬСЯ К ВХОДУ
              </Button>
            </div>
          </OrnateFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="medieval-title text-5xl medieval-accent-blood mb-2">
            ⚔️ КРОВАВЫЕ АРЕНЫ
          </h1>
          <p className="medieval-subtitle text-lg">
            Мир жестокости и темной магии
          </p>
        </div>

        <OrnateFrame title="ВОССТАНОВЛЕНИЕ ПАРОЛЯ" tone="epic" corners={4} edges>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="email" className="medieval-text-primary font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-gray-700 border-red-600 text-white"
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full medieval-button bg-blood hover:bg-red-700 text-white font-bold text-lg py-3"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'ОТПРАВИТЬ ПИСЬМО'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onBack}
              className="medieval-accent-blood hover:text-red-300 text-sm font-bold transition-colors"
            >
              Вернуться к входу
            </button>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default PasswordReset;
