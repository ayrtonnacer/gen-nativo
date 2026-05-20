'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLotes, getEspecies } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ProductionChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const lotes = getLotes();
    
    // Group by stage
    const byStage = {
      germinacion: 0,
      repique: 0,
      rusticacion: 0,
      campo: 0
    };
    
    lotes.forEach(lote => {
      byStage[lote.estado] += lote.cantidadActual;
    });
    
    const chartData = [
      { name: 'Germinación', value: byStage.germinacion, label: 'Germinación' },
      { name: 'Repique', value: byStage.repique, label: 'Repique' },
      { name: 'Rusticación', value: byStage.rusticacion, label: 'Rusticación' },
      { name: 'Campo', value: byStage.campo, label: 'Campo' }
    ];
    
    setData(chartData);
  }, []);

  const COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Etapa</CardTitle>
        <CardDescription>Cantidad de plantas en cada etapa de producción</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="label" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
