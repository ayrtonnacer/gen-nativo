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
import { Plus, Users, Edit, Building2 } from 'lucide-react';
import { UsuarioDeleteButton } from '@/components/admin/usuario-delete-button';

export default async function UsuariosPage() {
  const supabase = await createClient();

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*, gen_nativo:gen_nativos(nombre)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {usuarios && usuarios.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Gen Nativo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{usuario.nombre}</p>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.rol === 'admin' ? 'default' : 'secondary'}>
                        {usuario.rol === 'admin' ? 'Administrador' : 'Operador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.gen_nativo ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{usuario.gen_nativo.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? 'outline' : 'destructive'}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {usuario.debe_cambiar_password && (
                        <Badge variant="secondary" className="ml-2">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/usuarios/${usuario.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <UsuarioDeleteButton id={usuario.id} nombre={usuario.nombre} />
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
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No hay usuarios</CardTitle>
            <CardDescription className="text-center mb-4">
              Crea tu primer usuario para comenzar
            </CardDescription>
            <Link href="/admin/usuarios/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
