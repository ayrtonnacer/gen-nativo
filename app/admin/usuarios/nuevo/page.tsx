import { createClient } from '@/lib/supabase/server';
import { UsuarioForm } from '@/components/admin/usuario-form';

export default async function NuevoUsuarioPage() {
  const supabase = await createClient();

  const { data: genNativos } = await supabase
    .from('gen_nativos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuevo Usuario</h1>
        <p className="text-muted-foreground mt-1">
          Crea un nuevo usuario con contrasena temporal
        </p>
      </div>
      
      <UsuarioForm genNativos={genNativos || []} />
    </div>
  );
}
