import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UsuarioEditForm } from '@/components/admin/usuario-edit-form';

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: usuario }, { data: genNativos }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('gen_nativos')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre'),
  ]);

  if (!usuario) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Usuario</h1>
        <p className="text-muted-foreground mt-1">
          Modifica los datos de {usuario.nombre}
        </p>
      </div>
      
      <UsuarioEditForm usuario={usuario} genNativos={genNativos || []} />
    </div>
  );
}
