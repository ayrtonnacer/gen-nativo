'use client';

import { createClient } from './supabase/client';
import { ETAPA_LABELS } from './database.types';

function convertToCSV(data: Record<string, any>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map((row) =>
    headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

function downloadCSV(filename: string, csvContent: string) {
  const BOM = '﻿';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportLotesToExcel(etapa?: string) {
  const supabase = createClient();
  let query = supabase
    .from('lotes')
    .select('*, especie:especies(nombre_comun, nombre_cientifico), gen_nativo:gen_nativos(nombre)')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (etapa) query = query.eq('etapa', etapa);

  const { data: lotes } = await query;
  if (!lotes) return;

  const headers = ['Código', 'Especie', 'Nombre Científico', 'Gen Nativo', 'Etapa', 'Semillas (gr)', 'N° Semillas', 'Plantas actuales', 'Fecha siembra', 'Notas'];

  const data = lotes.map((l) => ({
    'Código': l.codigo,
    'Especie': (l.especie as any)?.nombre_comun ?? '',
    'Nombre Científico': (l.especie as any)?.nombre_cientifico ?? '',
    'Gen Nativo': (l.gen_nativo as any)?.nombre ?? '',
    'Etapa': ETAPA_LABELS[l.etapa] ?? l.etapa,
    'Semillas (gr)': l.cantidad_semillas_gramos ?? '',
    'N° Semillas': l.cantidad_semillas_n ?? '',
    'Plantas actuales': l.cantidad_actual,
    'Fecha siembra': l.fecha_siembra
      ? new Date(l.fecha_siembra + 'T00:00:00').toLocaleDateString('es-AR')
      : '',
    'Notas': l.notas ?? '',
  }));

  const filename = `gen-nativo-lotes${etapa ? `-${etapa}` : ''}-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, convertToCSV(data, headers));
}

export async function exportMovimientosToExcel() {
  const supabase = createClient();
  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('*, lote:lotes(codigo, especie:especies(nombre_comun)), sector_destino:sectores(tipo, codigo)')
    .order('fecha', { ascending: false });

  if (!movimientos) return;

  const headers = ['Fecha', 'Lote', 'Especie', 'Etapa origen', 'Etapa destino', 'Sector destino', 'Cantidad', 'Pérdidas', 'Motivo'];

  const data = movimientos.map((m) => ({
    'Fecha': new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-AR'),
    'Lote': (m.lote as any)?.codigo ?? '',
    'Especie': (m.lote as any)?.especie?.nombre_comun ?? '',
    'Etapa origen': ETAPA_LABELS[m.etapa_origen] ?? m.etapa_origen,
    'Etapa destino': ETAPA_LABELS[m.etapa_destino] ?? m.etapa_destino,
    'Sector destino': m.sector_destino
      ? `${(m.sector_destino as any).tipo} ${(m.sector_destino as any).codigo}`
      : '',
    'Cantidad': m.cantidad,
    'Pérdidas': m.perdidas,
    'Motivo': m.motivo_perdida ?? '',
  }));

  const filename = `gen-nativo-movimientos-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, convertToCSV(data, headers));
}
