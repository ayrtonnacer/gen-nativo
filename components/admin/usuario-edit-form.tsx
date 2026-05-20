'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Profile } from '@/lib/database.types';
import Link from 'next/link';

interface GenNativoOption {
  id: string;
  nombre: string;
}

interface UsuarioEditFormProps {
  usuario: Profile;
  genNativos: GenNativoOption[];
}

export function UsuarioEditForm({ usuario, genNativos }: UsuarioEditFormProps) {
  const router = useRouter();

  const [nombre, setNombre] = useState(usuario.nombre);
  const [rol, setRol] = useState<'admin' | 'operador'>(usuario.rol);
  const [genNativoId, setGenNativoId] = useState(usuario.gen_nativo_id || '');
  const [activo, setActivo] = useState(usuario.activo);
  const [debeCambiarPassword, setDebeCambiarPassword] = useState(usuario.debe_cambiar_password);
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

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nombre,
        rol,
        gen_nativo_id: rol === 'operador' ? genNativoId : null,
        activo,
        debe_cambiar_password: debeCambiarPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usuario.id);

    if (updateError) {
      setError(updateError.message);
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
            <Label>Correo electronico</Label>
            <Input value={usuario.email} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">
              El correo no se puede modificar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
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
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activo">Usuario activo</Label>
              <p className="text-sm text-muted-foreground">
                Los usuarios inactivos no pueden iniciar sesion
              </p>
            </div>
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={setActivo}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="debeCambiarPassword">Forzar cambio de contrasena</Label>
              <p className="text-sm text-muted-foreground">
                El usuario debera cambiar su contrasena al iniciar sesion
              </p>
            </div>
            <Switch
              id="debeCambiarPassword"
              checked={debeCambiarPassword}
              onCheckedChange={setDebeCambiarPassword}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Usuario'}
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
