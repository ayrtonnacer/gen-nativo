// Database types for Supabase

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
  etapa: 'germinacion' | 'repique' | 'rusticacion' | 'campo'
  cantidad_inicial: number
  cantidad_actual: number
  fecha_inicio: string
  fecha_etapa_actual: string | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
  // Joined fields
  especie?: Especie
  gen_nativo?: GenNativo
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
  etapa: 'germinacion' | 'repique' | 'rusticacion' | 'campo'
  cantidad_inicial: number
  cantidad_actual: number
  fecha_inicio: string
  notas: string
}

// Stats types
export interface DashboardStats {
  totalLotes: number
  lotesGerminacion: number
  lotesRepique: number
  lotesRusticacion: number
  lotesCampo: number
  totalPlantas: number
}
