'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Leaf, 
  Home, 
  LogOut,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';

interface AdminSidebarProps {
  profile: Profile;
}

const navItems = [
  { href: '/admin', label: 'Resumen', icon: Home },
  { href: '/admin/gen-nativos', label: 'Gen Nativos', icon: Building2 },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/especies', label: 'Especies', icon: Leaf },
];

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Panel Admin</h1>
            <p className="text-xs text-muted-foreground">Gen Nativo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{profile.nombre}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesion
        </Button>
      </div>
    </aside>
  );
}
