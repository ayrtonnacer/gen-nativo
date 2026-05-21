import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductionChartClient } from './production-chart-client';

export async function ProductionChart({ genNativoId }: { genNativoId?: string }) {
  const supabase = await createClient();

  let query = supabase.from('lotes').select('etapa, cantidad_actual').eq('activo', true);
  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  const byStage: Record<string, number> = {
    germinacion: 0,
    repique: 0,
    rusticacion: 0,
    campo: 0,
  };

  (lotes || []).forEach((l) => {
    if (l.etapa in byStage) byStage[l.etapa] += l.cantidad_actual;
  });

  const chartData = [
    { name: 'Cám. germinación', value: byStage.germinacion },
    { name: 'Repique', value: byStage.repique },
    { name: 'Rusticación', value: byStage.rusticacion },
    { name: 'Campo', value: byStage.campo },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantas por etapa</CardTitle>
        <CardDescription>Distribución de plantas en producción</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductionChartClient data={chartData} />
      </CardContent>
    </Card>
  );
}
