import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ETAPA_LABELS } from '@/lib/database.types';

const etapaColors: Record<string, string> = {
  germinacion: 'bg-blue-100 text-blue-800',
  repique: 'bg-green-100 text-green-800',
  rusticacion: 'bg-amber-100 text-amber-800',
  campo: 'bg-emerald-100 text-emerald-800',
};

export async function RecentBatches({ genNativoId }: { genNativoId?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('lotes')
    .select('id, codigo, etapa, cantidad_actual, fecha_siembra, especie:especies(nombre_comun)')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes recientes</CardTitle>
        <CardDescription>Últimos lotes creados</CardDescription>
      </CardHeader>
      <CardContent>
        {!lotes || lotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay lotes registrados</p>
        ) : (
          <div className="space-y-4">
            {lotes.map((lote) => (
              <Link key={lote.id} href={`/lotes/${lote.id}`} className="block">
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0 hover:opacity-80 transition-opacity">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{lote.codigo}</p>
                    <p className="text-sm text-muted-foreground">
                      {(lote.especie as any)?.nombre_comun ?? 'Sin especie'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="secondary" className={etapaColors[lote.etapa] ?? ''}>
                      {ETAPA_LABELS[lote.etapa] ?? lote.etapa}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {lote.cantidad_actual.toLocaleString()} plantas
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
