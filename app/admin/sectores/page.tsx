import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
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
import { Plus, Edit, MapPin } from 'lucide-react';
import { SECTOR_TIPO_LABELS, SectorTipo } from '@/lib/database.types';
import { SectorDeleteButton } from '@/components/admin/sector-delete-button';

export default async function SectoresPage() {
  const supabase = await createClient();

  const { data: genNativos } = await supabase
    .from('gen_nativos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');

  const { data: sectores } = await supabase
    .from('sectores')
    .select('*, gen_nativo:gen_nativos(nombre)')
    .order('gen_nativo_id')
    .order('tipo')
    .order('codigo');

  // Agrupar por gen_nativo
  const porGenNativo: Record<string, typeof sectores> = {};
  (sectores || []).forEach((s) => {
    if (!porGenNativo[s.gen_nativo_id]) porGenNativo[s.gen_nativo_id] = [];
    porGenNativo[s.gen_nativo_id]!.push(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sectores</h1>
          <p className="text-muted-foreground mt-1">
            Estanterías, camas, caballetes, macrotúneles y canchas por Gen Nativo
          </p>
        </div>
        <Link href="/admin/sectores/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sector
          </Button>
        </Link>
      </div>

      {!sectores || sectores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">No hay sectores</p>
            <p className="text-muted-foreground text-center mb-4">
              Crea los sectores físicos de cada Gen Nativo para poder registrar movimientos de lotes
            </p>
            <Link href="/admin/sectores/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Sector
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {(genNativos || []).map((gn) => {
            const sects = porGenNativo[gn.id] || [];
            if (sects.length === 0) return null;
            return (
              <div key={gn.id}>
                <h2 className="text-lg font-semibold mb-3">{gn.nombre}</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sects.map((sector) => (
                          <TableRow key={sector.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {SECTOR_TIPO_LABELS[sector.tipo as SectorTipo] ?? sector.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{sector.codigo}</TableCell>
                            <TableCell>
                              <Badge variant={sector.activo ? 'default' : 'secondary'}>
                                {sector.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/admin/sectores/${sector.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <SectorDeleteButton id={sector.id} codigo={sector.codigo} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
