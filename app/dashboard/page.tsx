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
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600 mt-1">Resumen de producción y estadísticas</p>
          </div>
          <div className="flex gap-3">
            <ExportMenu />
            <Button asChild>
              <Link href="/lotes/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lote
              </Link>
            </Button>
          </div>
        </div>
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ProductionChart />
          <SpeciesDistribution />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentBatches />
          <ProductionStages />
        </div>
      </main>
    </div>
  );
}
