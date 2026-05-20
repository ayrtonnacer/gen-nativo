'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEspecies } from '@/lib/data';

export function SpeciesDistribution() {
  const [especies, setEspecies] = useState<{ id: string; nombre: string; descripcion?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEspecies();
        setEspecies(data);
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribucion por Especie</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Cargando...</p>
        ) : especies.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay especies registradas.</p>
        ) : (
          <ul className="space-y-2">
            {especies.map((especie) => (
              <li key={especie.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{especie.nombre}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
