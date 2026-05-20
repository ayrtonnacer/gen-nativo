'use client';

import { useEffect, useState } from 'react';
import { StageCard } from './stage-card';
import { Sprout, Flower2, TreeDeciduous, TreePine } from 'lucide-react';
import { getLotes } from '@/lib/data';

export function ProductionStages() {
  const [counts, setCounts] = useState({
    germinacion: 0,
    repique: 0,
    rusticacion: 0,
    campo: 0
  });

  useEffect(() => {
    const lotes = getLotes();
    
    const newCounts = {
      germinacion: lotes.filter(l => l.estado === 'germinacion').length,
      repique: lotes.filter(l => l.estado === 'repique').length,
      rusticacion: lotes.filter(l => l.estado === 'rusticacion').length,
      campo: lotes.filter(l => l.estado === 'campo').length
    };
    
    setCounts(newCounts);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StageCard
        title="Germinación"
        description="Semillas en ambiente controlado"
        icon={Sprout}
        count={counts.germinacion}
        color="bg-blue-500"
        href="/etapas/germinacion"
      />
      <StageCard
        title="Repique"
        description="Trasplante a contenedores"
        icon={Flower2}
        count={counts.repique}
        color="bg-green-500"
        href="/etapas/repique"
      />
      <StageCard
        title="Rusticación"
        description="Adaptación progresiva"
        icon={TreeDeciduous}
        count={counts.rusticacion}
        color="bg-amber-500"
        href="/etapas/rusticacion"
      />
      <StageCard
        title="Campo"
        description="Listos para plantación"
        icon={TreePine}
        count={counts.campo}
        color="bg-emerald-600"
        href="/etapas/campo"
      />
    </div>
  );
}
