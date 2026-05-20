'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportLotesToExcel, exportResumenToExcel, exportMovimientosToExcel } from '@/lib/excel-export';
import { EstadoLote } from '@/lib/types';

interface ExportMenuProps {
  estado?: EstadoLote;
}

export function ExportMenu({ estado }: ExportMenuProps) {
  const handleExport = (type: 'lotes' | 'resumen' | 'movimientos') => {
    switch (type) {
      case 'lotes':
        exportLotesToExcel(estado);
        break;
      case 'resumen':
        exportResumenToExcel();
        break;
      case 'movimientos':
        exportMovimientosToExcel();
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar a Excel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('lotes')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {estado ? 'Lotes de esta etapa' : 'Todos los lotes'}
        </DropdownMenuItem>
        {!estado && (
          <>
            <DropdownMenuItem onClick={() => handleExport('resumen')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Resumen por especies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('movimientos')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Historial de movimientos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
