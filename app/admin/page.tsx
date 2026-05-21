import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Leaf, Package, MapPin } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: genNativosCount },
    { count: usuariosCount },
    { count: especiesCount },
    { count: lotesCount },
    { count: sectoresCount },
  ] = await Promise.all([
    supabase.from('gen_nativos').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('especies').select('*', { count: 'exact', head: true }),
    supabase.from('lotes').select('*', { count: 'exact', head: true }),
    supabase.from('sectores').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Gen Nativos', value: genNativosCount || 0, icon: Building2, color: 'text-primary' },
    { label: 'Usuarios', value: usuariosCount || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Especies', value: especiesCount || 0, icon: Leaf, color: 'text-green-600' },
    { label: 'Lotes Totales', value: lotesCount || 0, icon: Package, color: 'text-amber-600' },
    { label: 'Sectores', value: sectoresCount || 0, icon: MapPin, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administracion</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona Gen Nativos, usuarios y el catalogo de especies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
            <CardDescription>Tareas comunes de administracion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/gen-nativos/nuevo" className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Crear nuevo Gen Nativo</p>
                  <p className="text-sm text-muted-foreground">Agrega un nuevo invernadero</p>
                </div>
              </div>
            </a>
            <a href="/admin/usuarios/nuevo" className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Crear nuevo usuario</p>
                  <p className="text-sm text-muted-foreground">Agrega un operador a un Gen Nativo</p>
                </div>
              </div>
            </a>
            <a href="/admin/especies/nueva" className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Agregar especie</p>
                  <p className="text-sm text-muted-foreground">Expande el catalogo de especies</p>
                </div>
              </div>
            </a>
            <a href="/admin/sectores/nuevo" className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Agregar sector</p>
                  <p className="text-sm text-muted-foreground">Estantería, cama, caballete, macrotúnel o cancha</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informacion del Sistema</CardTitle>
            <CardDescription>Estado actual de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gen Nativos activos</span>
              <span className="font-medium">{genNativosCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Usuarios registrados</span>
              <span className="font-medium">{usuariosCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Especies en catalogo</span>
              <span className="font-medium">{especiesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lotes en produccion</span>
              <span className="font-medium">{lotesCount || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
