export type UserRole = 'admin' | 'tecnico' | 'agronomo';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  centroId: string;
}

export interface Centro {
  id: string;
  nombre: string;
  ubicacion: string;
}

export interface Especie {
  id: string;
  nombre: string;
  nombreCientifico: string;
}

export type EstadoLote = 'germinacion' | 'repique' | 'rusticacion' | 'campo';

export interface Lote {
  id: string;
  numero: string;
  especieId: string;
  centroId: string;
  estado: EstadoLote;
  cantidadInicial: number;
  cantidadActual: number;
  fechaInicio: string;
  fechaEstimadaFin?: string;
  temperaturaMin?: number;
  temperaturaMax?: number;
  humedadMin?: number;
  humedadMax?: number;
  observaciones?: string;
  creadoPor: string;
  creadoEl: string;
}

export interface MovimientoLote {
  id: string;
  loteId: string;
  estadoAnterior: EstadoLote;
  estadoNuevo: EstadoLote;
  cantidadMovida: number;
  perdidas: number;
  motivoPerdida?: string;
  fecha: string;
  realizadoPor: string;
}
