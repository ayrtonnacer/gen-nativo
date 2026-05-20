'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLotes, getEspecies, getCentros } from '@/lib/data';
import { Lote, EstadoLote } from '@/lib/types';
import { Eye, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface BatchTableProps {
  estado?: EstadoLote;
}

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

export function BatchTable({ estado }: BatchTableProps) {
  const [lotes, setLotes] = useState<any[]>([]);

  useEffect(() => {
    const allLotes = getLotes();
    const especies = getEspecies();
    const centros = getCentros();
    
    let filteredLotes = allLotes;
    if (estado) {
      filteredLotes = allLotes.filter(l => l.estado === estado);
    }
    
    const enrichedLotes = filteredLotes.map(lote => {
      const especie = especies.find(e => e.id === lote.especieId);
      const centro = centros.find(c => c.id === lote.centroId);
      const mortalidad = ((lote.cantidadInicial - lote.cantidadActual) / lote.cantidadInicial * 100).toFixed(1);
      
      return {
        ...lote,
        especieNombre: especie?.nombre || 'Desconocida',
        centroNombre: centro?.nombre || 'Desconocido',
        mortalidad: parseFloat(mortalidad)
      };
    }).sort((a, b) => new Date(b.creadoEl).getTime() - new Date(a.creadoEl).getTime());
    
    setLotes(enrichedLotes);
  }, [estado]);

  if (lotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay lotes en esta etapa</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lote</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Centro</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Mortalidad</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell className="font-medium">{lote.numero}</TableCell>
              <TableCell>{lote.especieNombre}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{lote.centroNombre}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={estadoColors[lote.estado]}>
                  {estadoLabels[lote.estado]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-medium">{lote.cantidadActual.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">
                    de {lote.cantidadInicial.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end gap-1 ${lote.mortalidad > 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {lote.mortalidad > 0 && <TrendingDown className="h-3 w-3" />}
                  <span className="font-medium">{lote.mortalidad}%</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(lote.fechaInicio).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/lotes/${lote.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
