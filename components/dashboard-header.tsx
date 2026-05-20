'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/database.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  profile: Profile | null;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!profile) return null;

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <div>
              <h1 className="text-2xl font-bold text-primary">Gen Nativo</h1>
              <p className="text-sm text-muted-foreground">Sistema de Produccion</p>
            </div>
          </Link>
          
          {profile.rol === 'admin' && (
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Panel Admin
                </Button>
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {profile.gen_nativo && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{profile.gen_nativo.nombre}</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">{profile.nombre}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Rol: {profile.rol}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile.rol === 'admin' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Panel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
