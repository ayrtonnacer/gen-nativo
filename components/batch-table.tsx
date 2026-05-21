import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ETAPA_LABELS } from '@/lib/database.types';

const etapaColors: Record<string, string> = {
  germinacion: 'bg-blue-100 text-blue-800',
  repique: 'bg-green-100 text-green-800',
  rusticacion: 'bg-amber-100 text-amber-800',
  campo: 'bg-emerald-100 text-emerald-800',
};

interface BatchTableProps {
  etapa?: string;
  genNativoId?: string;
}

export async function BatchTable({ etapa, genNativoId }: BatchTableProps) {
  const supabase = await createClient();

  let query = supabase
    .from('lotes')
    .select('*, especie:especies(nombre_comun, nombre_cientifico), gen_nativo:gen_nativos(nombre)')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (etapa) query = query.eq('etapa', etapa);
  if (genNativoId) query = query.eq('gen_nativo_id', genNativoId);

  const { data: lotes } = await query;

  if (!lotes || lotes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay lotes en esta etapa
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Plantas</TableHead>
            <TableHead>Fecha siembra</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell className="font-medium">{lote.codigo}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {lote.especie?.nombre_comun ?? <span className="text-muted-foreground">Sin especie</span>}
                  </p>
                  {lote.especie?.nombre_cientifico && (
                    <p className="text-xs text-muted-foreground italic">{lote.especie.nombre_cientifico}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={etapaColors[lote.etapa] ?? ''}>
                  {ETAPA_LABELS[lote.etapa] ?? lote.etapa}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-medium">{lote.cantidad_actual.toLocaleString()}</span>
                  {lote.cantidad_semillas_n && (
                    <span className="text-xs text-muted-foreground">
                      de {lote.cantidad_semillas_n.toLocaleString()} sem.
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {lote.fecha_siembra
                  ? new Date(lote.fecha_siembra + 'T00:00:00').toLocaleDateString('es-AR')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/lotes/${lote.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
