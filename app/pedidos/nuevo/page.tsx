import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NuevoPedidoForm } from '@/components/nuevo-pedido-form';

export default async function NuevoPedidoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gen_nativo:gen_nativos(id, nombre)')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/');

  // Cargar stock disponible: lote_ubicaciones con cantidad > 0, agrupadas
  let ubQuery = supabase
    .from('lote_ubicaciones')
    .select(`
      id, etapa, cantidad, envase_tipo,
      lote:lotes(id, codigo, gen_nativo_id, especie:especies(id, nombre_comun)),
      sector:sectores(id, tipo, codigo)
    `)
    .gt('cantidad', 0)
    .order('etapa');

  // Si no es admin, filtrar por gen_nativo
  const { data: ubicaciones } = await ubQuery;

  const genNativoId = profile.gen_nativo_id;
  const filtradas = (ubicaciones || []).filter((u) => {
    const lote = u.lote as any;
    return !genNativoId || lote?.gen_nativo_id === genNativoId;
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pedidos"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nuevo Pedido</h2>
            <p className="text-muted-foreground mt-1">Registrar entrega de plantas</p>
          </div>
        </div>
        <NuevoPedidoForm
          genNativoId={genNativoId || ''}
          userId={user.id}
          ubicacionesDisponibles={filtradas}
        />
      </main>
    </div>
  );
}
