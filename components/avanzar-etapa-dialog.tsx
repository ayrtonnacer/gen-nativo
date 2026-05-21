'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Sector,
  LoteUbicacion,
  ETAPA_LABELS,
  SECTOR_TIPO_LABELS,
  SECTOR_TIPO_ETAPA,
  Etapa,
  SectorTipo,
} from '@/lib/database.types';

interface AvanzarEtapaDialogProps {
  loteId: string;
  etapaActual: string;
  etapaDestino: string;
  cantidadDisponible: number;
  sectores: Sector[];
  ubicaciones: (LoteUbicacion & { sector?: Sector | null })[];
}

interface LineaDestino {
  sector_id: string;
  envase_tipo: string;
  cantidad: string;
}

const ETAPA_COLORS: Record<string, string> = {
  germinacion: 'text-blue-700',
  repique: 'text-green-700',
  rusticacion: 'text-amber-700',
};

export function AvanzarEtapaDialog({
  loteId,
  etapaActual,
  etapaDestino,
  cantidadDisponible,
  sectores,
  ubicaciones,
}: AvanzarEtapaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [perdidas, setPerdidas] = useState('0');
  const [motivoPerdida, setMotivoPerdida] = useState('');
  const [notas, setNotas] = useState('');

  const esDesdeGerminacion = etapaActual === 'germinacion';
  const [plantasGerminadas, setPlantasGerminadas] = useState('');

  const sectoresDestino = sectores.filter((s) =>
    SECTOR_TIPO_ETAPA[s.tipo as SectorTipo]?.includes(etapaDestino as Etapa)
  );

  const [lineas, setLineas] = useState<LineaDestino[]>([
    { sector_id: '', envase_tipo: '', cantidad: '' },
  ]);

  const addLinea = () =>
    setLineas([...lineas, { sector_id: '', envase_tipo: '', cantidad: '' }]);

  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  const updateLinea = (i: number, field: keyof LineaDestino, value: string) =>
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const totalLineas = lineas.reduce((s, l) => s + (parseInt(l.cantidad) || 0), 0);
  const cantidadBase = esDesdeGerminacion
    ? parseInt(plantasGerminadas) || 0
    : cantidadDisponible;

  const handleSubmit = async () => {
    setError('');

    if (esDesdeGerminacion && !plantasGerminadas) {
      setError('Ingresá la cantidad de plantas germinadas.');
      return;
    }
    if (totalLineas === 0) {
      setError('Agregá al menos una línea de destino con cantidad.');
      return;
    }
    if (totalLineas > cantidadBase) {
      setError(`Las plantas a mover (${totalLineas}) superan las disponibles (${cantidadBase}).`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const perdidasNum = parseInt(perdidas) || 0;

    // Para cada línea: crear movimiento + lote_ubicacion
    for (const linea of lineas) {
      const cant = parseInt(linea.cantidad) || 0;
      if (!cant) continue;

      // Buscar la ubicacion origen (la más reciente con cantidad)
      const ubicOrigen = ubicaciones.find((u) => u.cantidad > 0);

      const { error: movError } = await supabase.from('movimientos').insert({
        lote_id: loteId,
        etapa_origen: etapaActual,
        etapa_destino: etapaDestino,
        sector_origen_id: ubicOrigen?.sector_id ?? null,
        sector_destino_id: linea.sector_id || null,
        envase_tipo: linea.envase_tipo || null,
        cantidad: cant,
        perdidas: perdidasNum,
        motivo_perdida: motivoPerdida || null,
        fecha,
        usuario_id: user?.id ?? null,
        notas: notas || null,
      });

      if (movError) {
        setError(movError.message);
        setLoading(false);
        return;
      }

      const { error: ubError } = await supabase.from('lote_ubicaciones').insert({
        lote_id: loteId,
        etapa: etapaDestino,
        sector_id: linea.sector_id || null,
        envase_tipo: linea.envase_tipo || null,
        cantidad: cant,
        fecha_entrada: fecha,
      });

      if (ubError) {
        setError(ubError.message);
        setLoading(false);
        return;
      }
    }

    // Actualizar cantidad_actual del lote
    const cantidadNueva = esDesdeGerminacion
      ? (parseInt(plantasGerminadas) || 0) - perdidasNum
      : cantidadDisponible - perdidasNum;

    const { error: loteError } = await supabase
      .from('lotes')
      .update({
        etapa: etapaDestino,
        cantidad_actual: Math.max(0, cantidadNueva),
        fecha_etapa_actual: fecha,
      })
      .eq('id', loteId);

    if (loteError) {
      setError(loteError.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Pasar a {ETAPA_LABELS[etapaDestino] ?? etapaDestino}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avanzar etapa</DialogTitle>
          <DialogDescription>
            <span className={ETAPA_COLORS[etapaActual]}>
              {ETAPA_LABELS[etapaActual] ?? etapaActual}
            </span>
            {' → '}
            <span className={ETAPA_COLORS[etapaDestino]}>
              {ETAPA_LABELS[etapaDestino] ?? etapaDestino}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Fecha del movimiento</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          {esDesdeGerminacion && (
            <div className="space-y-2">
              <Label>Plantas germinadas *</Label>
              <Input
                type="number"
                min="0"
                max={cantidadDisponible}
                placeholder="Cantidad de plantas que germinaron"
                value={plantasGerminadas}
                onChange={(e) => setPlantasGerminadas(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Semillas sembradas: {cantidadDisponible.toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Destinos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addLinea} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Agregar sector
              </Button>
            </div>

            {lineas.map((linea, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-end">
                <div className="space-y-1">
                  {i === 0 && <p className="text-xs text-muted-foreground">Sector</p>}
                  <Select
                    value={linea.sector_id}
                    onValueChange={(v) => updateLinea(i, 'sector_id', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectoresDestino.length === 0 ? (
                        <SelectItem value="none" disabled>Sin sectores disponibles</SelectItem>
                      ) : (
                        sectoresDestino.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {SECTOR_TIPO_LABELS[s.tipo as SectorTipo] ?? s.tipo} {s.codigo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  {i === 0 && <p className="text-xs text-muted-foreground">Envase</p>}
                  <Select
                    value={linea.envase_tipo}
                    onValueChange={(v) => updateLinea(i, 'envase_tipo', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Envase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bandeja">Bandeja</SelectItem>
                      <SelectItem value="maceta">Maceta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  {i === 0 && <p className="text-xs text-muted-foreground">Cant.</p>}
                  <Input
                    className="h-9"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={linea.cantidad}
                    onChange={(e) => updateLinea(i, 'cantidad', e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 self-end text-muted-foreground hover:text-destructive"
                  onClick={() => removeLinea(i)}
                  disabled={lineas.length === 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            <div className="flex justify-between text-sm pt-1">
              <span className="text-muted-foreground">Total a mover</span>
              <span className={totalLineas > cantidadBase ? 'text-destructive font-medium' : 'font-medium'}>
                {totalLineas.toLocaleString()} / {cantidadBase.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Pérdidas</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={perdidas}
                onChange={(e) => setPerdidas(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo de pérdidas</Label>
              <Input
                placeholder="Ej: plagas"
                value={motivoPerdida}
                onChange={(e) => setMotivoPerdida(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas del movimiento</Label>
            <Textarea
              placeholder="Observaciones..."
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Confirmar movimiento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
