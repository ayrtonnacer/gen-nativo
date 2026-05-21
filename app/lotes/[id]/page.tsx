import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Sprout, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ETAPA_LABELS, SECTOR_TIPO_LABELS } from '@/lib/database.types';
import { AvanzarEtapaDialog } from '@/components/avanzar-etapa-dialog';

const etapaColors: Record<string, string> = {
  germinacion: 'bg-blue-100 text-blue-800',
  repique: 'bg-green-100 text-green-800',
  rusticacion: 'bg-amber-100 text-amber-800',
  campo: 'bg-emerald-100 text-emerald-800',
};

const nextStage: Record<string, string> = {
  germinacion: 'repique',
  repique: 'rusticacion',
  rusticacion: 'campo',
};

export default async function LoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gen_nativo:gen_nativos(id, nombre)')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/');

  const { data: lote } = await supabase
    .from('lotes')
    .select('*, especie:especies(*), gen_nativo:gen_nativos(nombre)')
    .eq('id', id)
    .eq('activo', true)
    .single();

  if (!lote) notFound();

  const [{ data: movimientos }, { data: ubicaciones }, { data: sectores }] = await Promise.all([
    supabase
      .from('movimientos')
      .select('*, sector_destino:sectores(tipo, codigo)')
      .eq('lote_id', id)
      .order('fecha', { ascending: false }),
    supabase
      .from('lote_ubicaciones')
      .select('*, sector:sectores(tipo, codigo)')
      .eq('lote_id', id)
      .gt('cantidad', 0)
      .order('fecha_entrada', { ascending: false }),
    supabase
      .from('sectores')
      .select('*')
      .eq('gen_nativo_id', lote.gen_nativo_id)
      .eq('activo', true)
      .order('tipo')
      .order('codigo'),
  ]);

  const siguienteEtapa = nextStage[lote.etapa];
  const totalUbicaciones = (ubicaciones || []).reduce((sum, u) => sum + u.cantidad, 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">{lote.codigo}</h2>
            <p className="text-muted-foreground mt-1">
              {lote.especie?.nombre_comun ?? 'Sin especie'}
              {lote.especie?.nombre_cientifico && (
                <em className="ml-2 text-sm">({lote.especie.nombre_cientifico})</em>
              )}
            </p>
          </div>
          {siguienteEtapa && (
            <AvanzarEtapaDialog
              loteId={lote.id}
              etapaActual={lote.etapa}
              etapaDestino={siguienteEtapa}
              cantidadDisponible={lote.cantidad_actual}
              sectores={sectores || []}
              ubicaciones={ubicaciones || []}
            />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Etapa actual</span>
                <Badge variant="secondary" className={etapaColors[lote.etapa]}>
                  {ETAPA_LABELS[lote.etapa] ?? lote.etapa}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gen Nativo</span>
                <span className="font-medium">{lote.gen_nativo?.nombre ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de siembra</span>
                <span className="font-medium">
                  {lote.fecha_siembra
                    ? new Date(lote.fecha_siembra + 'T00:00:00').toLocaleDateString('es-AR')
                    : '-'}
                </span>
              </div>
              {lote.cantidad_semillas_gramos && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Semillas sembradas</span>
                  <span className="font-medium">{lote.cantidad_semillas_gramos} g</span>
                </div>
              )}
              {lote.cantidad_semillas_n && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° semillas</span>
                  <span className="font-medium">{lote.cantidad_semillas_n.toLocaleString()}</span>
                </div>
              )}
              {lote.notas && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Notas</p>
                    <p className="text-sm leading-relaxed">{lote.notas}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Disponibles ahora</span>
                <span className="text-2xl font-bold">{lote.cantidad_actual.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registradas inicialmente</span>
                <span className="font-medium">{lote.cantidad_inicial.toLocaleString()}</span>
              </div>
              {lote.cantidad_semillas_n && lote.cantidad_actual > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasa de germinación</span>
                  <span className="font-medium text-green-700">
                    {((lote.cantidad_actual / lote.cantidad_semillas_n) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {totalUbicaciones > 0 && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">En sectores</p>
                  {(ubicaciones || []).map((u) => (
                    <div key={u.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {u.sector
                            ? `${SECTOR_TIPO_LABELS[u.sector.tipo as keyof typeof SECTOR_TIPO_LABELS] ?? u.sector.tipo} ${u.sector.codigo}`
                            : 'Sin sector'}
                          {u.envase_tipo && ` · ${u.envase_tipo}`}
                        </span>
                      </div>
                      <span className="font-medium">{u.cantidad.toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {movimientos && movimientos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historial de movimientos</CardTitle>
              <CardDescription>Cambios de etapa registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimientos.map((mov) => (
                  <div key={mov.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {ETAPA_LABELS[mov.etapa_origen] ?? mov.etapa_origen}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {ETAPA_LABELS[mov.etapa_destino] ?? mov.etapa_destino}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(mov.fecha + 'T00:00:00').toLocaleDateString('es-AR')} —{' '}
                        {mov.cantidad.toLocaleString()} plantas
                        {mov.sector_destino && (
                          <span className="ml-1">
                            → {SECTOR_TIPO_LABELS[mov.sector_destino.tipo as keyof typeof SECTOR_TIPO_LABELS] ?? mov.sector_destino.tipo}{' '}
                            {mov.sector_destino.codigo}
                          </span>
                        )}
                        {mov.perdidas > 0 && (
                          <span className="text-destructive ml-2">({mov.perdidas} pérdidas)</span>
                        )}
                      </p>
                      {mov.motivo_perdida && (
                        <p className="text-xs text-muted-foreground mt-1">Motivo: {mov.motivo_perdida}</p>
                      )}
                      {mov.notas && (
                        <p className="text-xs text-muted-foreground mt-1">{mov.notas}</p>
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
