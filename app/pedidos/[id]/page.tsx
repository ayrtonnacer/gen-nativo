import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ETAPA_LABELS, SECTOR_TIPO_LABELS, SectorTipo } from '@/lib/database.types';
import { PedidoEstadoButton } from '@/components/pedido-estado-button';

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: pedido } = await supabase
    .from('pedidos')
    .select(`
      *,
      items:pedido_items(
        id, cantidad,
        especie:especies(nombre_comun, nombre_cientifico),
        lote_ubicacion:lote_ubicaciones(
          etapa, envase_tipo,
          lote:lotes(codigo),
          sector:sectores(tipo, codigo)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!pedido) notFound();

  const totalPlantas = (pedido.items || []).reduce((s: number, i: any) => s + i.cantidad, 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pedidos"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">
              Pedido {pedido.destinatario ? `— ${pedido.destinatario}` : ''}
            </h2>
            <p className="text-muted-foreground mt-1">
              Creado el {new Date(pedido.fecha_creacion + 'T00:00:00').toLocaleDateString('es-AR')}
            </p>
          </div>
          {pedido.estado === 'pendiente' && (
            <PedidoEstadoButton pedidoId={pedido.id} nuevoEstado="entregado" />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant={pedido.estado === 'entregado' ? 'default' : 'secondary'}>
                  {pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinatario</span>
                <span className="font-medium">{pedido.destinatario || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entrega prevista</span>
                <span className="font-medium">
                  {pedido.fecha_entrega_prevista
                    ? new Date(pedido.fecha_entrega_prevista + 'T00:00:00').toLocaleDateString('es-AR')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total plantas</span>
                <span className="text-xl font-bold">{totalPlantas.toLocaleString()}</span>
              </div>
              {pedido.notas && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Notas</p>
                    <p className="text-sm leading-relaxed">{pedido.notas}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantas entregadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(pedido.items || []).map((item: any) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {item.especie?.nombre_comun ?? 'Sin especie'}
                      </p>
                      {item.lote_ubicacion && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.lote_ubicacion.lote?.codigo ?? '?'} ·{' '}
                          {ETAPA_LABELS[item.lote_ubicacion.etapa] ?? item.lote_ubicacion.etapa}
                          {item.lote_ubicacion.sector && (
                            <> · {SECTOR_TIPO_LABELS[item.lote_ubicacion.sector.tipo as SectorTipo] ?? item.lote_ubicacion.sector.tipo}{' '}
                              {item.lote_ubicacion.sector.codigo}</>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold">{item.cantidad.toLocaleString()}</span>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
