'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle } from 'lucide-react';

export function PedidoEstadoButton({
  pedidoId,
  nuevoEstado,
}: {
  pedidoId: string;
  nuevoEstado: 'entregado';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId);
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <CheckCircle className="h-3 w-3 mr-1" />
      {loading ? 'Guardando...' : 'Marcar entregado'}
    </Button>
  );
}
