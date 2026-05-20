'use client';

import { User } from './types';

const STORAGE_KEY = 'gen_nativo_user';

export function login(email: string, password: string): User | null {
  // Demo authentication - in production, this would call an API
  const users = getMockUsers();
  const user = users.find(u => u.email === email);
  
  if (user && password === 'demo123') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  
  return null;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getMockUsers(): User[] {
  return [
    {
      id: '1',
      email: 'admin@gennativo.gob.ar',
      name: 'Administrador',
      role: 'admin',
      centroId: 'centro-1'
    },
    {
      id: '2',
      email: 'tecnico@gennativo.gob.ar',
      name: 'Técnico de Laboratorio',
      role: 'tecnico',
      centroId: 'centro-1'
    },
    {
      id: '3',
      email: 'agronomo@gennativo.gob.ar',
      name: 'Ingeniero Agrónomo',
      role: 'agronomo',
      centroId: 'centro-2'
    }
  ];
}
