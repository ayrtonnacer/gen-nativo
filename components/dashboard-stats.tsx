'use client';

import { useEffect, useState } from 'react';
import { StatCard } from './stat-card';
import { Sprout, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { getLotes, getEspecies } from '@/lib/data';
import { Lote } from '@/lib/types';

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalPlantas: 0,
    lotesActivos: 0,
    tasaMortalidad: 0,
    especiesActivas: 0
  });

  useEffect(() => {
    const lotes = getLotes();
    const especies = getEspecies();
    
    const totalPlantas = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    const lotesActivos = lotes.length;
    
    // Calculate mortality rate
    const totalInicial = lotes.reduce((sum, lote) => sum + lote.cantidadInicial, 0);
    const totalActual = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    const tasaMortalidad = totalInicial > 0 
      ? ((totalInicial - totalActual) / totalInicial * 100) 
      : 0;
    
    // Count unique species in active lotes
    const especiesSet = new Set(lotes.map(l => l.especieId));
    const especiesActivas = especiesSet.size;
    
    setStats({
      totalPlantas,
      lotesActivos,
      tasaMortalidad: Math.round(tasaMortalidad * 10) / 10,
      especiesActivas
    });
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Plantas"
        value={stats.totalPlantas.toLocaleString()}
        description="En todas las etapas"
        icon={Sprout}
      />
      <StatCard
        title="Lotes Activos"
        value={stats.lotesActivos}
        description="En producción"
        icon={Package}
      />
      <StatCard
        title="Tasa de Mortalidad"
        value={`${stats.tasaMortalidad}%`}
        description="Promedio general"
        icon={AlertTriangle}
        className={stats.tasaMortalidad > 20 ? "border-destructive/50" : ""}
      />
      <StatCard
        title="Especies Activas"
        value={stats.especiesActivas}
        description="En cultivo"
        icon={TrendingUp}
      />
    </div>
  );
}
