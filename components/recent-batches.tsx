'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLotes, getEspecies } from '@/lib/data';
import { Lote, Especie } from '@/lib/types';

const estadoLabels = {
  germinacion: 'Germinación',
  repique: 'Repique',
  rusticacion: 'Rusticación',
  campo: 'Campo'
};

const estadoColors = {
  germinacion: 'bg-blue-500',
  repique: 'bg-green-500',
  rusticacion: 'bg-amber-500',
  campo: 'bg-emerald-600'
};

export function RecentBatches() {
  const [lotes, setLotes] = useState<(Lote & { especieNombre: string })[]>([]);

  useEffect(() => {
    const allLotes = getLotes();
    const especies = getEspecies();
    
    const lotesWithSpecies = allLotes
      .sort((a, b) => new Date(b.creadoEl).getTime() - new Date(a.creadoEl).getTime())
      .slice(0, 5)
      .map(lote => {
        const especie = especies.find(e => e.id === lote.especieId);
        return {
          ...lote,
          especieNombre: especie?.nombre || 'Desconocida'
        };
      });
    
    setLotes(lotesWithSpecies);
  }, []);

  if (lotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lotes Recientes</CardTitle>
          <CardDescription>Últimos lotes creados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay lotes registrados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes Recientes</CardTitle>
        <CardDescription>Últimos lotes creados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lotes.map((lote) => (
            <div key={lote.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium text-sm">{lote.numero}</p>
                <p className="text-sm text-muted-foreground">{lote.especieNombre}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="secondary" className={estadoColors[lote.estado]}>
                  {estadoLabels[lote.estado]}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {lote.cantidadActual.toLocaleString()} plantas
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
