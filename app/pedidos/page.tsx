import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, ClipboardList, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PedidoEstadoButton } from '@/components/pedido-estado-button';

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gen_nativo:gen_nativos(id, nombre)')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/');

  let query = supabase
    .from('pedidos')
    .select(`
      *,
      items:pedido_items(
        id, cantidad,
        especie:especies(nombre_comun),
        lote_ubicacion:lote_ubicaciones(
          etapa,
          sector:sectores(tipo, codigo)
        )
      )
    `)
    .order('fecha_creacion', { ascending: false });

  if (profile.gen_nativo_id) query = query.eq('gen_nativo_id', profile.gen_nativo_id);

  const { data: pedidos } = await query;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-muted-foreground mt-1">Entregas de plantas a campo</p>
          </div>
          <Button asChild>
            <Link href="/pedidos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Link>
          </Button>
        </div>

        {!pedidos || pedidos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">Sin pedidos</p>
              <p className="text-muted-foreground text-center mb-4">
                Los pedidos de entrega descuentan plantas de los sectores
              </p>
              <Button asChild>
                <Link href="/pedidos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Pedido
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Fecha creación</TableHead>
                    <TableHead>Entrega prevista</TableHead>
                    <TableHead>Plantas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => {
                    const totalPlantas = (pedido.items || []).reduce(
                      (s: number, i: any) => s + i.cantidad, 0
                    );
                    return (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-medium">
                          {pedido.destinatario || <span className="text-muted-foreground">Sin destinatario</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(pedido.fecha_creacion + 'T00:00:00').toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pedido.fecha_entrega_prevista
                            ? new Date(pedido.fecha_entrega_prevista + 'T00:00:00').toLocaleDateString('es-AR')
                            : '-'}
                        </TableCell>
                        <TableCell className="font-medium">{totalPlantas.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={pedido.estado === 'entregado' ? 'default' : 'secondary'}>
                            {pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/pedidos/${pedido.id}`}>Ver</Link>
                            </Button>
                            {pedido.estado === 'pendiente' && (
                              <PedidoEstadoButton pedidoId={pedido.id} nuevoEstado="entregado" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
