'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CambiarPasswordForm } from '@/components/cambiar-password-form';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales inválidas');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/`,
    });

    if (resetError) {
      setForgotError('No se pudo enviar el correo. Intenta de nuevo en unos minutos.');
      setForgotLoading(false);
      return;
    }

    setForgotSent(true);
    setForgotLoading(false);
  };

  if (isRecovery) {
    return (
      <CambiarPasswordForm
        title="Definir nueva contrasena"
        description="Confirmamos tu identidad. Elegi una contrasena nueva para tu cuenta."
      />
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-9 h-9 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-balance">Recuperar contrasena</CardTitle>
              <CardDescription className="text-base mt-2">
                Te enviamos un enlace a tu correo para definir una contrasena nueva
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {forgotSent ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Si el correo {forgotEmail} esta registrado, te llegara un enlace para
                    definir una contrasena nueva. Revisa tu bandeja de entrada y spam.
                  </AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMode('login');
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                >
                  Volver a iniciar sesion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <Alert variant="destructive">
                    <AlertDescription>{forgotError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Correo electronico</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="usuario@gennativo.gob.ar"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={forgotLoading}>
                  {forgotLoading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('login')}
                >
                  Volver a iniciar sesion
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Leaf className="w-9 h-9 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-balance">Gen Nativo</CardTitle>
            <CardDescription className="text-base mt-2">
              Sistema de Produccion de Arboles Nativos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@gennativo.gob.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setMode('forgot')}
            >
              ¿Olvidaste tu contrasena?
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
