import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, MapPin, Edit, Trash2 } from 'lucide-react';
import { GenNativoDeleteButton } from '@/components/admin/gen-nativo-delete-button';

export default async function GenNativosPage() {
  const supabase = await createClient();

  const { data: genNativos } = await supabase
    .from('gen_nativos')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gen Nativos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los invernaderos de produccion
          </p>
        </div>
        <Link href="/admin/gen-nativos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gen Nativo
          </Button>
        </Link>
      </div>

      {genNativos && genNativos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {genNativos.map((genNativo) => (
            <Card key={genNativo.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{genNativo.nombre}</CardTitle>
                      {genNativo.ubicacion && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {genNativo.ubicacion}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={genNativo.activo ? 'default' : 'secondary'}>
                    {genNativo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {genNativo.descripcion && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {genNativo.descripcion}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/gen-nativos/${genNativo.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <GenNativoDeleteButton id={genNativo.id} nombre={genNativo.nombre} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No hay Gen Nativos</CardTitle>
            <CardDescription className="text-center mb-4">
              Crea tu primer Gen Nativo para comenzar a gestionar la produccion
            </CardDescription>
            <Link href="/admin/gen-nativos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Gen Nativo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
