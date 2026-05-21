import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard-header';
import { BatchTable } from '@/components/batch-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function RusticacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gen_nativo:gen_nativos(id, nombre)')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Rusticación</h2>
            <p className="text-muted-foreground mt-1">Adaptación progresiva en canchas</p>
          </div>
          <Button asChild>
            <Link href="/lotes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Lote
            </Link>
          </Button>
        </div>
        <BatchTable etapa="rusticacion" genNativoId={profile.gen_nativo_id ?? undefined} />
      </main>
    </div>
  );
}
