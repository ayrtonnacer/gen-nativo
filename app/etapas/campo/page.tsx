'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { BatchTable } from '@/components/batch-table';
import { ExportMenu } from '@/components/export-menu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CampoPage() {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Campo</h2>
            <p className="text-muted-foreground mt-1">
              Árboles listos para plantación definitiva
            </p>
          </div>
          <ExportMenu estado="campo" />
          <Button asChild>
            <Link href="/lotes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Lote
            </Link>
          </Button>
        </div>

        <BatchTable estado="campo" />
      </main>
    </div>
  );
}
