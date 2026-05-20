import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Leaf, Edit } from 'lucide-react';
import { EspecieDeleteButton } from '@/components/admin/especie-delete-button';

export default async function EspeciesPage() {
  const supabase = await createClient();

  const { data: especies } = await supabase
    .from('especies')
    .select('*')
    .order('nombre_comun');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Especies</h1>
          <p className="text-muted-foreground mt-1">
            Catalogo global de especies nativas
          </p>
        </div>
        <Link href="/admin/especies/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Especie
          </Button>
        </Link>
      </div>

      {especies && especies.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Comun</TableHead>
                  <TableHead>Nombre Cientifico</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.map((especie) => (
                  <TableRow key={especie.id}>
                    <TableCell className="font-medium">{especie.nombre_comun}</TableCell>
                    <TableCell>
                      {especie.nombre_cientifico ? (
                        <em className="text-muted-foreground">{especie.nombre_cientifico}</em>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {especie.descripcion || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={especie.activo ? 'outline' : 'secondary'}>
                        {especie.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/especies/${especie.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <EspecieDeleteButton id={especie.id} nombre={especie.nombre_comun} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No hay especies</CardTitle>
            <CardDescription className="text-center mb-4">
              Crea tu primera especie para comenzar el catalogo
            </CardDescription>
            <Link href="/admin/especies/nueva">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Especie
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
