'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardStats } from '@/components/dashboard-stats';
import { ProductionChart } from '@/components/production-chart';
import { SpeciesDistribution } from '@/components/species-distribution';
import { RecentBatches } from '@/components/recent-batches';
import { ProductionStages } from '@/components/production-stages';
import { ExportMenu } from '@/components/export-menu';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
            <p className="text-muted-foreground mt-1">
              Resumen de producción y estadísticas
            </p>
          </div>
          <div className="flex gap-2">
            <ExportMenu />
            <Button asChild>
              <Link href="/lotes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Lote
              </Link>
            </Button>
          </div>
        </div>

        <DashboardStats />

        <div>
          <h3 className="text-xl font-semibold mb-4">Etapas de Producción</h3>
          <ProductionStages />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProductionChart />
          <SpeciesDistribution />
        </div>

        <RecentBatches />
      </main>
    </div>
  );
}
