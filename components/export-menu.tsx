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
import { exportLotesToExcel, exportMovimientosToExcel } from '@/lib/excel-export';

interface ExportMenuProps {
  etapa?: string;
}

export function ExportMenu({ etapa }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar a CSV</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportLotesToExcel(etapa)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {etapa ? 'Lotes de esta etapa' : 'Todos los lotes'}
        </DropdownMenuItem>
        {!etapa && (
          <DropdownMenuItem onClick={() => exportMovimientosToExcel()}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Historial de movimientos
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
