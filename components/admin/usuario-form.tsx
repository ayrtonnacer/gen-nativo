'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface GenNativoOption {
  id: string;
  nombre: string;
}

interface UsuarioFormProps {
  genNativos: GenNativoOption[];
}

export function UsuarioForm({ genNativos }: UsuarioFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'admin' | 'operador'>('operador');
  const [genNativoId, setGenNativoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (rol === 'operador' && !genNativoId) {
      setError('Los operadores deben tener un Gen Nativo asignado');
      setLoading(false);
      return;
    }

    // Call API route to create user with admin privileges
    const response = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nombre,
        password,
        rol,
        gen_nativo_id: rol === 'operador' ? genNativoId : null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Error al crear usuario');
      setLoading(false);
      return;
    }

    router.push('/admin/usuarios');
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Perez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electronico *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@gennativo.gob.ar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contrasena temporal *</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              minLength={6}
            />
            <p className="text-sm text-muted-foreground">
              El usuario debera cambiar esta contrasena en su primer inicio de sesion
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select value={rol} onValueChange={(v) => setRol(v as 'admin' | 'operador')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operador">Operador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rol === 'operador' && (
            <div className="space-y-2">
              <Label htmlFor="genNativo">Gen Nativo *</Label>
              <Select value={genNativoId} onValueChange={setGenNativoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un Gen Nativo" />
                </SelectTrigger>
                <SelectContent>
                  {genNativos.map((gn) => (
                    <SelectItem key={gn.id} value={gn.id}>
                      {gn.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {genNativos.length === 0 && (
                <p className="text-sm text-amber-600">
                  No hay Gen Nativos activos. Crea uno primero.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
            <Link href="/admin/usuarios">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
