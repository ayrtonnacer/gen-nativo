import { createClient } from '@/lib/supabase/server';
import { StatCard } from './stat-card';
import { Sprout, Package, Layers, Truck } from 'lucide-react';

export async function DashboardStats({ genNativoId }: { genNativoId?: string }) {
  const supabase = await createClient();

  let query = supabase.from('lotes').select('etapa, cantidad_actual').eq('activo', true);
  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  const totalPlantas = (lotes || []).reduce((s, l) => s + l.cantidad_actual, 0);
  const porEtapa = (etapa: string) => (lotes || []).filter((l) => l.etapa === etapa).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de plantas"
        value={totalPlantas.toLocaleString()}
        description="En producción activa"
        icon={Sprout}
      />
      <StatCard
        title="Cámara germinación"
        value={porEtapa('germinacion')}
        description="Lotes en cámara"
        icon={Layers}
      />
      <StatCard
        title="Repique"
        value={porEtapa('repique')}
        description="Lotes en invernadero"
        icon={Package}
      />
      <StatCard
        title="Rusticación"
        value={porEtapa('rusticacion')}
        description="Lotes en canchas"
        icon={Truck}
      />
    </div>
  );
}
