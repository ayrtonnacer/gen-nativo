import { createClient } from '@/lib/supabase/server';
import { StageCard } from './stage-card';
import { Sprout, Flower2, TreeDeciduous, TreePine } from 'lucide-react';

export async function ProductionStages({ genNativoId }: { genNativoId?: string }) {
  const supabase = await createClient();

  let query = supabase.from('lotes').select('etapa, cantidad_actual').eq('activo', true);
  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  const count = (etapa: string) =>
    (lotes || []).filter((l) => l.etapa === etapa).length;

  const plantas = (etapa: string) =>
    (lotes || []).filter((l) => l.etapa === etapa).reduce((s, l) => s + l.cantidad_actual, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StageCard
        title="Cámara de germinación"
        description={`${plantas('germinacion').toLocaleString()} semillas`}
        icon={Sprout}
        count={count('germinacion')}
        color="bg-blue-500"
        href="/etapas/germinacion"
      />
      <StageCard
        title="Repique"
        description={`${plantas('repique').toLocaleString()} plantas`}
        icon={Flower2}
        count={count('repique')}
        color="bg-green-500"
        href="/etapas/repique"
      />
      <StageCard
        title="Rusticación"
        description={`${plantas('rusticacion').toLocaleString()} plantas`}
        icon={TreeDeciduous}
        count={count('rusticacion')}
        color="bg-amber-500"
        href="/etapas/rusticacion"
      />
      <StageCard
        title="Campo"
        description={`${plantas('campo').toLocaleString()} plantas`}
        icon={TreePine}
        count={count('campo')}
        color="bg-emerald-600"
        href="/etapas/campo"
      />
    </div>
  );
}
