// Database types for Supabase

export type SectorTipo = 'estanteria' | 'cama' | 'caballete' | 'macrotunel' | 'cancha'
export type EnvaseTipo = 'bandeja' | 'maceta'
export type PedidoEstado = 'pendiente' | 'entregado'
export type Etapa = 'germinacion' | 'repique' | 'rusticacion'

export interface GenNativo {
  id: string
  nombre: string
  ubicacion: string | null
  descripcion: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'operador'
  gen_nativo_id: string | null
  debe_cambiar_password: boolean
  activo: boolean
  created_at: string
  updated_at: string
  // Joined fields
  gen_nativo?: GenNativo
}

export interface Especie {
  id: string
  nombre_comun: string
  nombre_cientifico: string | null
  descripcion: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Lote {
  id: string
  codigo: string
  gen_nativo_id: string
  especie_id: string | null
  etapa: Etapa | 'campo'
  cantidad_inicial: number
  cantidad_actual: number
  fecha_inicio: string
  fecha_siembra: string | null
  cantidad_semillas_gramos: number | null
  cantidad_semillas_n: number | null
  fecha_etapa_actual: string | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
  // Joined fields
  especie?: Especie
  gen_nativo?: GenNativo
}

export interface Sector {
  id: string
  gen_nativo_id: string
  tipo: SectorTipo
  codigo: string
  activo: boolean
  created_at: string
  updated_at: string
  // Joined
  gen_nativo?: GenNativo
}

export interface LoteUbicacion {
  id: string
  lote_id: string
  etapa: Etapa
  sector_id: string | null
  envase_tipo: EnvaseTipo | null
  cantidad: number
  fecha_entrada: string
  created_at: string
  updated_at: string
  // Joined
  lote?: Lote
  sector?: Sector
}

export interface Movimiento {
  id: string
  lote_id: string
  etapa_origen: string
  etapa_destino: string
  sector_origen_id: string | null
  sector_destino_id: string | null
  envase_tipo: EnvaseTipo | null
  cantidad: number
  perdidas: number
  motivo_perdida: string | null
  fecha: string
  usuario_id: string | null
  notas: string | null
  created_at: string
  // Joined
  lote?: Lote
  sector_destino?: Sector
}

export interface Pedido {
  id: string
  gen_nativo_id: string
  destinatario: string | null
  fecha_creacion: string
  fecha_entrega_prevista: string | null
  estado: PedidoEstado
  notas: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  gen_nativo?: GenNativo
  items?: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  lote_ubicacion_id: string
  especie_id: string | null
  cantidad: number
  created_at: string
  // Joined
  lote_ubicacion?: LoteUbicacion & {
    lote?: Lote & { especie?: Especie }
    sector?: Sector
  }
  especie?: Especie
}

// Form types
export interface GenNativoForm {
  nombre: string
  ubicacion: string
  descripcion: string
}

export interface ProfileForm {
  email: string
  nombre: string
  password: string
  rol: 'admin' | 'operador'
  gen_nativo_id: string
}

export interface EspecieForm {
  nombre_comun: string
  nombre_cientifico: string
  descripcion: string
}

export interface LoteForm {
  codigo: string
  especie_id: string
  etapa: Etapa | 'campo'
  fecha_siembra: string
  cantidad_semillas_gramos: string
  cantidad_semillas_n: string
  cantidad_inicial: string
  notas: string
}

export interface SectorForm {
  tipo: SectorTipo
  codigo: string
  activo: boolean
}

export interface PedidoForm {
  destinatario: string
  fecha_entrega_prevista: string
  notas: string
  items: PedidoItemForm[]
}

export interface PedidoItemForm {
  lote_ubicacion_id: string
  especie_id: string
  cantidad: number
}

// Stats types
export interface DashboardStats {
  totalPlantas: number
  lotesGerminacion: number
  lotesRepique: number
  lotesRusticacion: number
  lotesCampo: number
  lotesActivos: number
}

// Labels helpers (exported for reuse across pages)
export const ETAPA_LABELS: Record<string, string> = {
  germinacion: 'Cámara de germinación',
  repique: 'Repique',
  rusticacion: 'Rusticación',
  campo: 'Campo',
}

export const SECTOR_TIPO_LABELS: Record<SectorTipo, string> = {
  estanteria: 'Estantería',
  cama: 'Cama',
  caballete: 'Caballete',
  macrotunel: 'Macrotúnel',
  cancha: 'Cancha',
}

export const SECTOR_TIPO_ETAPA: Record<SectorTipo, Etapa[]> = {
  estanteria: ['germinacion'],
  cama: ['repique'],
  caballete: ['repique'],
  macrotunel: ['repique'],
  cancha: ['rusticacion'],
}
