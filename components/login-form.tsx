'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf } from 'lucide-react';
import { login } from '@/lib/auth';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = login(email, password);
    
    if (user) {
      router.push('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
    
    setLoading(false);
  };

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
              Sistema de Producción de Árboles Nativos
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
              <Label htmlFor="email">Correo electrónico</Label>
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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Usuarios de demostración:
              </p>
              <div className="space-y-2 text-xs">
                <div className="bg-muted p-2 rounded">
                  <strong>Admin:</strong> admin@gennativo.gob.ar
                </div>
                <div className="bg-muted p-2 rounded">
                  <strong>Técnico:</strong> tecnico@gennativo.gob.ar
                </div>
                <div className="bg-muted p-2 rounded">
                  <strong>Agrónomo:</strong> agronomo@gennativo.gob.ar
                </div>
                <p className="text-center text-muted-foreground mt-2">
                  Contraseña: <code className="bg-muted px-2 py-1 rounded">demo123</code>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
