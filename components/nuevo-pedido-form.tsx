'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ETAPA_LABELS, SECTOR_TIPO_LABELS, SectorTipo } from '@/lib/database.types';

interface UbicacionDisponible {
  id: string;
  etapa: string;
  cantidad: number;
  envase_tipo: string | null;
  lote: { id: string; codigo: string; gen_nativo_id: string; especie: { id: string; nombre_comun: string } | null } | null;
  sector: { id: string; tipo: string; codigo: string } | null;
}

interface LineaItem {
  ubicacion_id: string;
  cantidad: string;
}

interface NuevoPedidoFormProps {
  genNativoId: string;
  userId: string;
  ubicacionesDisponibles: UbicacionDisponible[];
}

export function NuevoPedidoForm({ genNativoId, userId, ubicacionesDisponibles }: NuevoPedidoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [destinatario, setDestinatario] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [lineas, setLineas] = useState<LineaItem[]>([{ ubicacion_id: '', cantidad: '' }]);

  const addLinea = () => setLineas([...lineas, { ubicacion_id: '', cantidad: '' }]);
  const removeLinea = (i: number) => setLineas(lineas.filter((_, idx) => idx !== i));
  const updateLinea = (i: number, field: keyof LineaItem, value: string) =>
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const getUbicacion = (id: string) => ubicacionesDisponibles.find((u) => u.id === id);

  const totalLineas = lineas.reduce((s, l) => s + (parseInt(l.cantidad) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lineasValidas = lineas.filter((l) => l.ubicacion_id && parseInt(l.cantidad) > 0);
    if (lineasValidas.length === 0) {
      setError('Agregá al menos una línea con ubicación y cantidad.');
      return;
    }

    // Validar que no supere stock
    for (const linea of lineasValidas) {
      const ub = getUbicacion(linea.ubicacion_id);
      if (!ub) continue;
      const cant = parseInt(linea.cantidad);
      if (cant > ub.cantidad) {
        setError(`La cantidad (${cant}) supera el stock disponible (${ub.cantidad}) en ${ub.lote?.codigo} / ${ub.sector?.codigo ?? 'Sin sector'}.`);
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    // Crear pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        gen_nativo_id: genNativoId,
        destinatario: destinatario.trim() || null,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_entrega_prevista: fechaEntrega || null,
        estado: 'pendiente',
        notas: notas.trim() || null,
        created_by: userId,
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      setError(pedidoError?.message || 'Error al crear el pedido.');
      setLoading(false);
      return;
    }

    // Crear items y descontar stock
    for (const linea of lineasValidas) {
      const ub = getUbicacion(linea.ubicacion_id);
      if (!ub) continue;
      const cant = parseInt(linea.cantidad);

      const { error: itemError } = await supabase.from('pedido_items').insert({
        pedido_id: pedido.id,
        lote_ubicacion_id: linea.ubicacion_id,
        especie_id: ub.lote?.especie?.id ?? null,
        cantidad: cant,
      });

      if (itemError) {
        setError(itemError.message);
        setLoading(false);
        return;
      }

      // Descontar del inventario
      const { error: ubError } = await supabase
        .from('lote_ubicaciones')
        .update({ cantidad: ub.cantidad - cant })
        .eq('id', linea.ubicacion_id);

      if (ubError) {
        setError(ubError.message);
        setLoading(false);
        return;
      }

      // Actualizar cantidad_actual del lote
      if (ub.lote?.id) {
        const { data: loteActual } = await supabase
          .from('lotes')
          .select('cantidad_actual')
          .eq('id', ub.lote.id)
          .single();
        if (loteActual) {
          await supabase
            .from('lotes')
            .update({ cantidad_actual: Math.max(0, loteActual.cantidad_actual - cant) })
            .eq('id', ub.lote.id);
        }
      }
    }

    router.push('/pedidos');
    router.refresh();
  };

  const formatUbicacion = (u: UbicacionDisponible) => {
    const etapa = ETAPA_LABELS[u.etapa] ?? u.etapa;
    const sector = u.sector
      ? `${SECTOR_TIPO_LABELS[u.sector.tipo as SectorTipo] ?? u.sector.tipo} ${u.sector.codigo}`
      : 'Sin sector';
    const especie = u.lote?.especie?.nombre_comun ?? 'Sin especie';
    return `${u.lote?.codigo ?? '?'} · ${especie} · ${etapa} · ${sector} (${u.cantidad.toLocaleString()} disp.)`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatario</Label>
              <Input
                id="destinatario"
                placeholder="Ej: Juan Pérez"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega">Fecha de entrega prevista</Label>
              <Input
                id="fecha_entrega"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones del pedido..."
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plantas a entregar</CardTitle>
              <CardDescription>Seleccioná el origen (lote + sector) y cantidad</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLinea}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar línea
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ubicacionesDisponibles.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              No hay plantas disponibles en ningún sector. Primero mové lotes a etapas con sector asignado.
            </div>
          ) : (
            <>
              {lineas.map((linea, i) => {
                const ub = getUbicacion(linea.ubicacion_id);
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      {i === 0 && <p className="text-xs text-muted-foreground">Origen (lote · especie · etapa · sector)</p>}
                      <Select
                        value={linea.ubicacion_id}
                        onValueChange={(v) => updateLinea(i, 'ubicacion_id', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          {ubicacionesDisponibles.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {formatUbicacion(u)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {ub && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Stock disponible: <strong>{ub.cantidad.toLocaleString()}</strong>
                          {ub.envase_tipo && ` · ${ub.envase_tipo}`}
                        </p>
                      )}
                    </div>
                    <div className="w-28 space-y-1">
                      {i === 0 && <p className="text-xs text-muted-foreground">Cantidad</p>}
                      <Input
                        type="number"
                        min="1"
                        max={ub?.cantidad}
                        placeholder="0"
                        value={linea.cantidad}
                        onChange={(e) => updateLinea(i, 'cantidad', e.target.value)}
                        className={
                          ub && parseInt(linea.cantidad) > ub.cantidad
                            ? 'border-destructive'
                            : ''
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive mt-5"
                      onClick={() => removeLinea(i)}
                      disabled={lineas.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total a entregar</span>
                <Badge variant="outline" className="text-base font-semibold px-3">
                  {totalLineas.toLocaleString()} plantas
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || ubicacionesDisponibles.length === 0} className="flex-1">
          {loading ? 'Guardando...' : 'Crear Pedido'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/pedidos')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
