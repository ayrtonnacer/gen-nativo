'use client';

import { Centro, Especie, Lote, MovimientoLote } from './types';

const CENTROS_KEY = 'gen_nativo_centros';
const ESPECIES_KEY = 'gen_nativo_especies';
const LOTES_KEY = 'gen_nativo_lotes';
const MOVIMIENTOS_KEY = 'gen_nativo_movimientos';

// Initialize default data
function initializeData() {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(CENTROS_KEY)) {
    localStorage.setItem(CENTROS_KEY, JSON.stringify(getDefaultCentros()));
  }
  if (!localStorage.getItem(ESPECIES_KEY)) {
    localStorage.setItem(ESPECIES_KEY, JSON.stringify(getDefaultEspecies()));
  }
  if (!localStorage.getItem(LOTES_KEY)) {
    localStorage.setItem(LOTES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(MOVIMIENTOS_KEY)) {
    localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify([]));
  }
}

function getDefaultCentros(): Centro[] {
  return [
    { id: 'centro-1', nombre: 'Laboratorio Central', ubicacion: 'Córdoba Capital' },
    { id: 'centro-2', nombre: 'Centro Norte', ubicacion: 'Cruz del Eje' },
    { id: 'centro-3', nombre: 'Centro Sur', ubicacion: 'Río Cuarto' }
  ];
}

function getDefaultEspecies(): Especie[] {
  return [
    { id: '1', nombre: 'Algarrobo blanco', nombreCientifico: 'Prosopis alba' },
    { id: '2', nombre: 'Algarrobo negro', nombreCientifico: 'Prosopis nigra' },
    { id: '3', nombre: 'Espinillo', nombreCientifico: 'Acacia caven' },
    { id: '4', nombre: 'Chañar', nombreCientifico: 'Geoffroea decorticans' },
    { id: '5', nombre: 'Molle', nombreCientifico: 'Schinus areira' },
    { id: '6', nombre: 'Coco', nombreCientifico: 'Fagara coco' },
    { id: '7', nombre: 'Tala', nombreCientifico: 'Celtis ehrenbergiana' },
    { id: '8', nombre: 'Quebracho blanco', nombreCientifico: 'Aspidosperma quebracho-blanco' },
    { id: '9', nombre: 'Mistol', nombreCientifico: 'Sarcomphalus mistol' },
    { id: '10', nombre: 'Palo amarillo', nombreCientifico: 'Terminalia australis' },
    { id: '11', nombre: 'Atamisqui', nombreCientifico: 'Atamisquea emarginata' },
    { id: '12', nombre: 'Jarilla', nombreCientifico: 'Larrea divaricata' },
    { id: '13', nombre: 'Garabato', nombreCientifico: 'Acacia praecox' },
    { id: '14', nombre: 'Sauce criollo', nombreCientifico: 'Salix humboldtiana' }
  ];
}

// Centros
export function getCentros(): Centro[] {
  initializeData();
  const stored = localStorage.getItem(CENTROS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Especies
export function getEspecies(): Especie[] {
  initializeData();
  const stored = localStorage.getItem(ESPECIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Lotes
export function getLotes(): Lote[] {
  initializeData();
  const stored = localStorage.getItem(LOTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addLote(lote: Lote): void {
  const lotes = getLotes();
  lotes.push(lote);
  localStorage.setItem(LOTES_KEY, JSON.stringify(lotes));
}

export function updateLote(id: string, updates: Partial<Lote>): void {
  const lotes = getLotes();
  const index = lotes.findIndex(l => l.id === id);
  if (index !== -1) {
    lotes[index] = { ...lotes[index], ...updates };
    localStorage.setItem(LOTES_KEY, JSON.stringify(lotes));
  }
}

// Movimientos
export function getMovimientos(): MovimientoLote[] {
  initializeData();
  const stored = localStorage.getItem(MOVIMIENTOS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addMovimiento(movimiento: MovimientoLote): void {
  const movimientos = getMovimientos();
  movimientos.push(movimiento);
  localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos));
}
