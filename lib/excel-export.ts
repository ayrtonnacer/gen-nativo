'use client';

import { getLotes, getEspecies, getCentros, getMovimientos } from './data';
import { Lote, EstadoLote } from './types';

const estadoLabels = {
  germinacion: 'Germinación',
  repique: 'Repique',
  rusticacion: 'Rusticación',
  campo: 'Campo'
};

function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

function downloadCSV(filename: string, csvContent: string) {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLotesToExcel(estado?: EstadoLote) {
  const lotes = getLotes();
  const especies = getEspecies();
  const centros = getCentros();

  let filteredLotes = lotes;
  if (estado) {
    filteredLotes = lotes.filter(l => l.estado === estado);
  }

  const data = filteredLotes.map(lote => {
    const especie = especies.find(e => e.id === lote.especieId);
    const centro = centros.find(c => c.id === lote.centroId);
    const mortalidad = ((lote.cantidadInicial - lote.cantidadActual) / lote.cantidadInicial * 100).toFixed(1);

    return {
      'Número de Lote': lote.numero,
      'Especie': especie?.nombre || 'Desconocida',
      'Nombre Científico': especie?.nombreCientifico || '',
      'Centro': centro?.nombre || 'Desconocido',
      'Etapa': estadoLabels[lote.estado],
      'Cantidad Inicial': lote.cantidadInicial,
      'Cantidad Actual': lote.cantidadActual,
      'Pérdidas': lote.cantidadInicial - lote.cantidadActual,
      'Mortalidad (%)': mortalidad,
      'Fecha Inicio': new Date(lote.fechaInicio).toLocaleDateString('es-AR'),
      'Temperatura Min (°C)': lote.temperaturaMin || '',
      'Temperatura Max (°C)': lote.temperaturaMax || '',
      'Humedad Min (%)': lote.humedadMin || '',
      'Humedad Max (%)': lote.humedadMax || '',
      'Observaciones': lote.observaciones || ''
    };
  });

  const headers = [
    'Número de Lote',
    'Especie',
    'Nombre Científico',
    'Centro',
    'Etapa',
    'Cantidad Inicial',
    'Cantidad Actual',
    'Pérdidas',
    'Mortalidad (%)',
    'Fecha Inicio',
    'Temperatura Min (°C)',
    'Temperatura Max (°C)',
    'Humedad Min (%)',
    'Humedad Max (%)',
    'Observaciones'
  ];

  const csv = convertToCSV(data, headers);
  const filename = estado 
    ? `gen-nativo-${estado}-${new Date().toISOString().split('T')[0]}.csv`
    : `gen-nativo-todos-los-lotes-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(filename, csv);
}

export function exportResumenToExcel() {
  const lotes = getLotes();
  const especies = getEspecies();
  
  // Summary by species
  const especiesData: any = {};
  
  lotes.forEach(lote => {
    if (!especiesData[lote.especieId]) {
      especiesData[lote.especieId] = {
        cantidadTotal: 0,
        cantidadInicial: 0,
        germinacion: 0,
        repique: 0,
        rusticacion: 0,
        campo: 0
      };
    }
    
    especiesData[lote.especieId].cantidadTotal += lote.cantidadActual;
    especiesData[lote.especieId].cantidadInicial += lote.cantidadInicial;
    especiesData[lote.especieId][lote.estado] += lote.cantidadActual;
  });

  const data = Object.entries(especiesData).map(([especieId, stats]: [string, any]) => {
    const especie = especies.find(e => e.id === especieId);
    const mortalidad = ((stats.cantidadInicial - stats.cantidadTotal) / stats.cantidadInicial * 100).toFixed(1);
    
    return {
      'Especie': especie?.nombre || 'Desconocida',
      'Nombre Científico': especie?.nombreCientifico || '',
      'Total Plantas': stats.cantidadTotal,
      'En Germinación': stats.germinacion,
      'En Repique': stats.repique,
      'En Rusticación': stats.rusticacion,
      'En Campo': stats.campo,
      'Mortalidad (%)': mortalidad
    };
  });

  const headers = [
    'Especie',
    'Nombre Científico',
    'Total Plantas',
    'En Germinación',
    'En Repique',
    'En Rusticación',
    'En Campo',
    'Mortalidad (%)'
  ];

  const csv = convertToCSV(data, headers);
  const filename = `gen-nativo-resumen-especies-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(filename, csv);
}

export function exportMovimientosToExcel() {
  const movimientos = getMovimientos();
  const lotes = getLotes();
  const especies = getEspecies();

  const data = movimientos
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map(mov => {
      const lote = lotes.find(l => l.id === mov.loteId);
      const especie = especies.find(e => e.id === lote?.especieId);

      return {
        'Fecha': new Date(mov.fecha).toLocaleDateString('es-AR'),
        'Lote': lote?.numero || 'Desconocido',
        'Especie': especie?.nombre || 'Desconocida',
        'Etapa Anterior': estadoLabels[mov.estadoAnterior],
        'Etapa Nueva': estadoLabels[mov.estadoNuevo],
        'Cantidad Movida': mov.cantidadMovida,
        'Pérdidas': mov.perdidas,
        'Motivo Pérdida': mov.motivoPerdida || ''
      };
    });

  const headers = [
    'Fecha',
    'Lote',
    'Especie',
    'Etapa Anterior',
    'Etapa Nueva',
    'Cantidad Movida',
    'Pérdidas',
    'Motivo Pérdida'
  ];

  const csv = convertToCSV(data, headers);
  const filename = `gen-nativo-movimientos-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(filename, csv);
}
