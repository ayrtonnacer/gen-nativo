'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { GenNativo } from '@/lib/database.types';
import Link from 'next/link';

interface GenNativoFormProps {
  genNativo?: GenNativo;
}

export function GenNativoForm({ genNativo }: GenNativoFormProps) {
  const router = useRouter();
  const isEditing = !!genNativo;

  const [nombre, setNombre] = useState(genNativo?.nombre || '');
  const [ubicacion, setUbicacion] = useState(genNativo?.ubicacion || '');
  const [descripcion, setDescripcion] = useState(genNativo?.descripcion || '');
  const [activo, setActivo] = useState(genNativo?.activo ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const data = {
      nombre,
      ubicacion: ubicacion || null,
      descripcion: descripcion || null,
      activo,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from('gen_nativos')
        .update(data)
        .eq('id', genNativo.id);
    } else {
      result = await supabase.from('gen_nativos').insert(data);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/gen-nativos');
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
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gen Nativo Cordoba"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicacion</Label>
            <Input
              id="ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Cordoba, Argentina"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripcion</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripcion del invernadero..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activo">Estado activo</Label>
              <p className="text-sm text-muted-foreground">
                Los Gen Nativos inactivos no pueden crear nuevos lotes
              </p>
            </div>
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={setActivo}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Gen Nativo'}
            </Button>
            <Link href="/admin/gen-nativos">
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
