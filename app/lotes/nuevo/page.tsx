'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { addLote } from '@/lib/data';
import { getEspecies, getCentros } from '@/lib/data';
import { Lote, EstadoLote } from '@/lib/types';

export default function NewBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [especies, setEspecies] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    numero: '',
    especieId: '',
    centroId: '',
    estado: 'germinacion' as EstadoLote,
    cantidadInicial: '',
    temperaturaMin: '',
    temperaturaMax: '',
    humedadMin: '',
    humedadMax: '',
    observaciones: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    
    setEspecies(getEspecies());
    setCentros(getCentros());
    
    // Set default centro to user's centro
    setFormData(prev => ({ ...prev, centroId: user.centroId }));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = getCurrentUser();
    if (!user) return;

    const newLote: Lote = {
      id: `lote-${Date.now()}`,
      numero: formData.numero,
      especieId: formData.especieId,
      centroId: formData.centroId,
      estado: formData.estado,
      cantidadInicial: parseInt(formData.cantidadInicial),
      cantidadActual: parseInt(formData.cantidadInicial),
      fechaInicio: new Date().toISOString(),
      temperaturaMin: formData.temperaturaMin ? parseFloat(formData.temperaturaMin) : undefined,
      temperaturaMax: formData.temperaturaMax ? parseFloat(formData.temperaturaMax) : undefined,
      humedadMin: formData.humedadMin ? parseFloat(formData.humedadMin) : undefined,
      humedadMax: formData.humedadMax ? parseFloat(formData.humedadMax) : undefined,
      observaciones: formData.observaciones || undefined,
      creadoPor: user.id,
      creadoEl: new Date().toISOString()
    };

    addLote(newLote);
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nuevo Lote</h2>
            <p className="text-muted-foreground mt-1">
              Registrar un nuevo lote de producción
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
            <CardDescription>Complete los datos del nuevo lote</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número de Lote *</Label>
                  <Input
                    id="numero"
                    placeholder="L-2024-001"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especie">Especie *</Label>
                  <Select
                    value={formData.especieId}
                    onValueChange={(value) => setFormData({ ...formData, especieId: value })}
                    required
                  >
                    <SelectTrigger id="especie">
                      <SelectValue placeholder="Seleccionar especie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map((especie) => (
                        <SelectItem key={especie.id} value={especie.id}>
                          {especie.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centro">Centro de Producción *</Label>
                  <Select
                    value={formData.centroId}
                    onValueChange={(value) => setFormData({ ...formData, centroId: value })}
                    required
                  >
                    <SelectTrigger id="centro">
                      <SelectValue placeholder="Seleccionar centro" />
                    </SelectTrigger>
                    <SelectContent>
                      {centros.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id}>
                          {centro.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Etapa Inicial *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value as EstadoLote })}
                    required
                  >
                    <SelectTrigger id="estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="germinacion">Germinación</SelectItem>
                      <SelectItem value="repique">Repique</SelectItem>
                      <SelectItem value="rusticacion">Rusticación</SelectItem>
                      <SelectItem value="campo">Campo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad Inicial *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={formData.cantidadInicial}
                    onChange={(e) => setFormData({ ...formData, cantidadInicial: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Parámetros Ambientales (Opcional)
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tempMin">Temperatura Mínima (°C)</Label>
                    <Input
                      id="tempMin"
                      type="number"
                      step="0.1"
                      placeholder="18"
                      value={formData.temperaturaMin}
                      onChange={(e) => setFormData({ ...formData, temperaturaMin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempMax">Temperatura Máxima (°C)</Label>
                    <Input
                      id="tempMax"
                      type="number"
                      step="0.1"
                      placeholder="25"
                      value={formData.temperaturaMax}
                      onChange={(e) => setFormData({ ...formData, temperaturaMax: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humMin">Humedad Mínima (%)</Label>
                    <Input
                      id="humMin"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="60"
                      value={formData.humedadMin}
                      onChange={(e) => setFormData({ ...formData, humedadMin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humMax">Humedad Máxima (%)</Label>
                    <Input
                      id="humMax"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="80"
                      value={formData.humedadMax}
                      onChange={(e) => setFormData({ ...formData, humedadMax: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas adicionales sobre el lote..."
                  rows={4}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creando...' : 'Crear Lote'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
