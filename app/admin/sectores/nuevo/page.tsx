import { createClient } from '@/lib/supabase/server';
import { SectorForm } from '@/components/admin/sector-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NuevoSectorPage() {
  const supabase = await createClient();
  const { data: genNativos } = await supabase
    .from('gen_nativos')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/sectores">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Sector</h1>
          <p className="text-muted-foreground mt-1">Agregar un sector físico a un Gen Nativo</p>
        </div>
      </div>
      <SectorForm genNativos={genNativos || []} />
    </div>
  );
}
