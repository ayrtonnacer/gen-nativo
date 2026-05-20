'use client';
import { createClient } from '@/lib/supabase/client';
import { User } from './types';

// Convierte el perfil de Supabase (columnas en español) al tipo User del app
function profileToUser(profile: {
  id: string;
  email: string;
  nombre: string | null;
  rol: string;
  gen_nativo_id: string | null;
}): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.nombre ?? profile.email,
    role: profile.rol as User['role'],
    centroId: profile.gen_nativo_id ?? 'sin-asignar',
  };
}

// Obtiene el usuario actual desde Supabase Auth + tabla profiles
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, nombre, rol, gen_nativo_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;
  return profileToUser(profile);
}

// Cierra sesión en Supabase
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Devuelve true si el usuario es admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
