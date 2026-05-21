'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Sector, GenNativo, SECTOR_TIPO_LABELS, SectorTipo } from '@/lib/database.types';
import Link from 'next/link';

interface SectorFormProps {
  sector?: Sector;
  genNativos: GenNativo[];
}

const TIPOS: SectorTipo[] = ['estanteria', 'cama', 'caballete', 'macrotunel', 'cancha'];

export function SectorForm({ sector, genNativos }: SectorFormProps) {
  const router = useRouter();
  const isEditing = !!sector;

  const [genNativoId, setGenNativoId] = useState(sector?.gen_nativo_id || '');
  const [tipo, setTipo] = useState<SectorTipo>(sector?.tipo || 'estanteria');
  const [codigo, setCodigo] = useState(sector?.codigo || '');
  const [activo, setActivo] = useState(sector?.activo ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const data = {
      gen_nativo_id: genNativoId,
      tipo,
      codigo: codigo.trim(),
      activo,
      updated_at: new Date().toISOString(),
    };

    const result = isEditing
      ? await supabase.from('sectores').update(data).eq('id', sector.id)
      : await supabase.from('sectores').insert(data);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/sectores');
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
            <Label htmlFor="gen_nativo">Gen Nativo *</Label>
            <Select value={genNativoId} onValueChange={setGenNativoId} required>
              <SelectTrigger id="gen_nativo">
                <SelectValue placeholder="Seleccionar Gen Nativo" />
              </SelectTrigger>
              <SelectContent>
                {genNativos.map((gn) => (
                  <SelectItem key={gn.id} value={gn.id}>{gn.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de sector *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as SectorTipo)} required>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>{SECTOR_TIPO_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {tipo === 'estanteria' && 'Para cámara de germinación. Ej: Estantería 1, Estantería 2...'}
              {tipo === 'cama' && 'Para invernadero / repique. Ej: Cama 1, Cama 2'}
              {tipo === 'caballete' && 'Para invernadero / repique. Ej: 1A, 1B, 1C'}
              {tipo === 'macrotunel' && 'Para macrotúnel / repique. Ej: 1A, 1B, 2A, 2B'}
              {tipo === 'cancha' && 'Para rusticación. Ej: 1A, 1B, 2A, 4C'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder={
                tipo === 'estanteria' ? 'Ej: 1, 2, 3...' :
                tipo === 'cama' ? 'Ej: Cama 1, Cama 2' :
                tipo === 'caballete' ? 'Ej: 1A, 1B, 1C' :
                tipo === 'macrotunel' ? 'Ej: 1A, 1B, 2A, 2B' :
                'Ej: 1A, 1B, 4C'
              }
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activo</Label>
              <p className="text-sm text-muted-foreground">Los sectores inactivos no aparecen al mover lotes</p>
            </div>
            <Switch checked={activo} onCheckedChange={setActivo} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Sector'}
            </Button>
            <Link href="/admin/sectores">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
