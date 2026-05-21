import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export async function SpeciesDistribution({ genNativoId }: { genNativoId?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('lotes')
    .select('especie_id, cantidad_actual, especie:especies(nombre_comun)')
    .eq('activo', true)
    .not('especie_id', 'is', null);

  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  // Agrupar por especie
  const byEspecie: Record<string, { nombre: string; plantas: number; lotes: number }> = {};
  (lotes || []).forEach((l) => {
    if (!l.especie_id) return;
    const nombre = (l.especie as any)?.nombre_comun ?? 'Desconocida';
    if (!byEspecie[l.especie_id]) {
      byEspecie[l.especie_id] = { nombre, plantas: 0, lotes: 0 };
    }
    byEspecie[l.especie_id].plantas += l.cantidad_actual;
    byEspecie[l.especie_id].lotes += 1;
  });

  const entries = Object.values(byEspecie).sort((a, b) => b.plantas - a.plantas);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por especie</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Sin datos</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.nombre} className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{e.nombre}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-muted-foreground">{e.plantas.toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs">{e.lotes} lote{e.lotes !== 1 ? 's' : ''}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
