import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SectorForm } from '@/components/admin/sector-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditSectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: sector }, { data: genNativos }] = await Promise.all([
    supabase.from('sectores').select('*').eq('id', id).single(),
    supabase.from('gen_nativos').select('*').eq('activo', true).order('nombre'),
  ]);

  if (!sector) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/sectores">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Sector</h1>
          <p className="text-muted-foreground mt-1">{sector.codigo}</p>
        </div>
      </div>
      <SectorForm sector={sector} genNativos={genNativos || []} />
    </div>
  );
}
