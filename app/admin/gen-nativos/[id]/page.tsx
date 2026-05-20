import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GenNativoForm } from '@/components/admin/gen-nativo-form';

export default async function EditarGenNativoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: genNativo } = await supabase
    .from('gen_nativos')
    .select('*')
    .eq('id', id)
    .single();

  if (!genNativo) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Gen Nativo</h1>
        <p className="text-muted-foreground mt-1">
          Modifica los datos de {genNativo.nombre}
        </p>
      </div>
      
      <GenNativoForm genNativo={genNativo} />
    </div>
  );
}
