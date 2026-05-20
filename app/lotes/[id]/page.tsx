'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, ArrowRight, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { getLotes, getEspecies, getCentros, getMovimientos, addMovimiento, updateLote } from '@/lib/data';
import { Lote, MovimientoLote, EstadoLote } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const estadoLabels = {
  germinacion: 'Germinación',
  repique: 'Repique',
  rusticacion: 'Rusticación',
  campo: 'Campo'
};

const estadoColors = {
  germinacion: 'bg-blue-500',
  repique: 'bg-green-500',
  rusticacion: 'bg-amber-500',
  campo: 'bg-emerald-600'
};

const nextStage: { [key in EstadoLote]?: EstadoLote } = {
  germinacion: 'repique',
  repique: 'rusticacion',
  rusticacion: 'campo'
};

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [lote, setLote] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [moveData, setMoveData] = useState({
    cantidadMovida: '',
    perdidas: '',
    motivoPerdida: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }

    const allLotes = getLotes();
    const especies = getEspecies();
    const centros = getCentros();
    const foundLote = allLotes.find(l => l.id === params.id);

    if (foundLote) {
      const especie = especies.find(e => e.id === foundLote.especieId);
      const centro = centros.find(c => c.id === foundLote.centroId);
      const mortalidad = ((foundLote.cantidadInicial - foundLote.cantidadActual) / foundLote.cantidadInicial * 100).toFixed(1);

      setLote({
        ...foundLote,
        especieNombre: especie?.nombre || 'Desconocida',
        especieCientifica: especie?.nombreCientifico || '',
        centroNombre: centro?.nombre || 'Desconocido',
        mortalidad: parseFloat(mortalidad)
      });

      // Load movements
      const allMovimientos = getMovimientos();
      const loteMovimientos = allMovimientos.filter(m => m.loteId === foundLote.id);
      setMovimientos(loteMovimientos);
    }
  }, [params.id, router]);

  const handleMoveToNextStage = () => {
    if (!lote) return;

    const user = getCurrentUser();
    if (!user) return;

    const cantidadMovida = parseInt(moveData.cantidadMovida) || lote.cantidadActual;
    const perdidas = parseInt(moveData.perdidas) || 0;
    const siguienteEtapa = nextStage[lote.estado as EstadoLote];

    if (!siguienteEtapa) return;

    // Create movement record
    const movimiento: MovimientoLote = {
      id: `mov-${Date.now()}`,
      loteId: lote.id,
      estadoAnterior: lote.estado,
      estadoNuevo: siguienteEtapa,
      cantidadMovida,
      perdidas,
      motivoPerdida: moveData.motivoPerdida || undefined,
      fecha: new Date().toISOString(),
      realizadoPor: user.id
    };

    addMovimiento(movimiento);

    // Update lote
    updateLote(lote.id, {
      estado: siguienteEtapa,
      cantidadActual: cantidadMovida - perdidas
    });

    setOpenDialog(false);
    router.refresh();
    window.location.reload();
  };

  if (!lote) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">{lote.numero}</h2>
            <p className="text-muted-foreground mt-1">{lote.especieNombre}</p>
          </div>
          {nextStage[lote.estado as EstadoLote] && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  Avanzar a {estadoLabels[nextStage[lote.estado as EstadoLote]!]}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Avanzar a siguiente etapa</DialogTitle>
                  <DialogDescription>
                    Mover lote de {estadoLabels[lote.estado]} a {estadoLabels[nextStage[lote.estado as EstadoLote]!]}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cantidad a mover</Label>
                    <Input
                      type="number"
                      max={lote.cantidadActual}
                      placeholder={lote.cantidadActual.toString()}
                      value={moveData.cantidadMovida}
                      onChange={(e) => setMoveData({ ...moveData, cantidadMovida: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Disponibles: {lote.cantidadActual.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Pérdidas registradas</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={moveData.perdidas}
                      onChange={(e) => setMoveData({ ...moveData, perdidas: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo de pérdidas (opcional)</Label>
                    <Textarea
                      placeholder="Ej: plagas, sequía, etc."
                      value={moveData.motivoPerdida}
                      onChange={(e) => setMoveData({ ...moveData, motivoPerdida: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleMoveToNextStage}>
                    Confirmar movimiento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Etapa Actual</span>
                <Badge variant="secondary" className={estadoColors[lote.estado]}>
                  {estadoLabels[lote.estado]}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Especie</span>
                <span className="font-medium">{lote.especieNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Nombre científico</span>
                <span className="text-sm italic">{lote.especieCientifica}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Centro</span>
                <span className="font-medium">{lote.centroNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de inicio</span>
                <span className="font-medium">
                  {new Date(lote.fechaInicio).toLocaleDateString('es-AR')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cantidad Actual</span>
                <span className="text-2xl font-bold">{lote.cantidadActual.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cantidad Inicial</span>
                <span className="font-medium">{lote.cantidadInicial.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pérdidas totales</span>
                <span className="font-medium">
                  {(lote.cantidadInicial - lote.cantidadActual).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tasa de Mortalidad</span>
                <div className={`flex items-center gap-1 ${lote.mortalidad > 20 ? 'text-destructive' : 'text-foreground'}`}>
                  {lote.mortalidad > 0 && <TrendingDown className="h-4 w-4" />}
                  <span className="text-xl font-bold">{lote.mortalidad}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {(lote.temperaturaMin || lote.humedadMin) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Parámetros Ambientales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {lote.temperaturaMin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium">
                      {lote.temperaturaMin}°C - {lote.temperaturaMax}°C
                    </span>
                  </div>
                )}
                {lote.humedadMin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humedad</span>
                    <span className="font-medium">
                      {lote.humedadMin}% - {lote.humedadMax}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {lote.observaciones && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{lote.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {movimientos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Cambios de etapa registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimientos.map((mov) => (
                  <div key={mov.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {estadoLabels[mov.estadoAnterior]}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {estadoLabels[mov.estadoNuevo]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(mov.fecha).toLocaleDateString('es-AR')} - 
                        Movidos: {mov.cantidadMovida.toLocaleString()} | 
                        Pérdidas: {mov.perdidas.toLocaleString()}
                      </p>
                      {mov.motivoPerdida && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Motivo: {mov.motivoPerdida}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
