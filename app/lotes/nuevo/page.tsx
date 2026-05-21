'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Leaf } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Especie, Profile, ETAPA_LABELS } from '@/lib/database.types';

export default function NewLotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [showNewEspecie, setShowNewEspecie] = useState(false);
  const [newEspecieLoading, setNewEspecieLoading] = useState(false);
  const [newEspecieNombre, setNewEspecieNombre] = useState('');
  const [newEspecieCientifico, setNewEspecieCientifico] = useState('');

  const [formData, setFormData] = useState({
    codigo: '',
    especie_id: '',
    etapa: 'germinacion',
    fecha_siembra: new Date().toISOString().split('T')[0],
    cantidad_semillas_gramos: '',
    cantidad_semillas_n: '',
    cantidad_inicial: '',
    notas: '',
  });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: p } = await supabase
        .from('profiles')
        .select('*, gen_nativo:gen_nativos(id, nombre)')
        .eq('id', user.id)
        .single();

      if (!p) { router.push('/'); return; }
      setProfile(p);

      const { data: esp } = await supabase
        .from('especies')
        .select('*')
        .eq('activo', true)
        .order('nombre_comun');
      setEspecies(esp || []);
    }
    load();
  }, [router]);

  const loadEspecies = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('especies')
      .select('*')
      .eq('activo', true)
      .order('nombre_comun');
    setEspecies(data || []);
  };

  const handleCreateEspecie = async () => {
    if (!newEspecieNombre.trim()) return;
    setNewEspecieLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('especies')
      .insert({
        nombre_comun: newEspecieNombre.trim(),
        nombre_cientifico: newEspecieCientifico.trim() || null,
        activo: true,
      })
      .select()
      .single();

    if (!error && data) {
      await loadEspecies();
      setFormData(prev => ({ ...prev, especie_id: data.id }));
      setNewEspecieNombre('');
      setNewEspecieCientifico('');
      setShowNewEspecie(false);
    }
    setNewEspecieLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from('lotes').insert({
      codigo: formData.codigo,
      gen_nativo_id: profile.gen_nativo_id,
      especie_id: formData.especie_id || null,
      etapa: formData.etapa,
      fecha_siembra: formData.fecha_siembra || null,
      cantidad_semillas_gramos: formData.cantidad_semillas_gramos
        ? parseFloat(formData.cantidad_semillas_gramos)
        : null,
      cantidad_semillas_n: formData.cantidad_semillas_n
        ? parseInt(formData.cantidad_semillas_n)
        : null,
      cantidad_inicial: parseInt(formData.cantidad_inicial) || 0,
      cantidad_actual: parseInt(formData.cantidad_inicial) || 0,
      fecha_inicio: new Date().toISOString(),
      notas: formData.notas || null,
      activo: true,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nuevo Lote</h2>
            <p className="text-muted-foreground mt-1">Registrar un nuevo lote de producción</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
            <CardDescription>Complete los datos del nuevo lote</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código del lote *</Label>
                  <Input
                    id="codigo"
                    placeholder="Ej: L-2026-001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etapa">Etapa inicial *</Label>
                  <Select
                    value={formData.etapa}
                    onValueChange={(v) => setFormData({ ...formData, etapa: v })}
                  >
                    <SelectTrigger id="etapa">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ETAPA_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="especie">Especie</Label>
                    <Dialog open={showNewEspecie} onOpenChange={setShowNewEspecie}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="text-xs h-7">
                          <Plus className="h-3 w-3 mr-1" />
                          Nueva especie
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar especie</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label>Nombre común *</Label>
                            <Input
                              placeholder="Ej: Algarrobo blanco"
                              value={newEspecieNombre}
                              onChange={(e) => setNewEspecieNombre(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nombre científico</Label>
                            <Input
                              placeholder="Ej: Prosopis alba"
                              value={newEspecieCientifico}
                              onChange={(e) => setNewEspecieCientifico(e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateEspecie}
                            disabled={newEspecieLoading || !newEspecieNombre.trim()}
                            className="w-full"
                          >
                            {newEspecieLoading ? 'Guardando...' : 'Crear especie'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={formData.especie_id}
                    onValueChange={(v) => setFormData({ ...formData, especie_id: v })}
                  >
                    <SelectTrigger id="especie">
                      <SelectValue placeholder="Seleccionar especie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map((esp) => (
                        <SelectItem key={esp.id} value={esp.id}>
                          <span className="flex items-center gap-2">
                            <Leaf className="h-3 w-3 text-muted-foreground" />
                            {esp.nombre_comun}
                            {esp.nombre_cientifico && (
                              <em className="text-muted-foreground text-xs">({esp.nombre_cientifico})</em>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_siembra">Fecha de siembra *</Label>
                  <Input
                    id="fecha_siembra"
                    type="date"
                    value={formData.fecha_siembra}
                    onChange={(e) => setFormData({ ...formData, fecha_siembra: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad_semillas_gramos">Semillas (gramos)</Label>
                  <Input
                    id="cantidad_semillas_gramos"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 250.5"
                    value={formData.cantidad_semillas_gramos}
                    onChange={(e) => setFormData({ ...formData, cantidad_semillas_gramos: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad_semillas_n">Cantidad de semillas (unidades)</Label>
                  <Input
                    id="cantidad_semillas_n"
                    type="number"
                    min="0"
                    placeholder="Ej: 5000"
                    value={formData.cantidad_semillas_n}
                    onChange={(e) => setFormData({ ...formData, cantidad_semillas_n: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad_inicial">Cantidad inicial de plantas</Label>
                  <Input
                    id="cantidad_inicial"
                    type="number"
                    min="0"
                    placeholder="Ej: 1000"
                    value={formData.cantidad_inicial}
                    onChange={(e) => setFormData({ ...formData, cantidad_inicial: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Dejar en 0 si todavía no germinaron</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
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
