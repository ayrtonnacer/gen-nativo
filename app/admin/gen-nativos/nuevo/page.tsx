import { GenNativoForm } from '@/components/admin/gen-nativo-form';

export default function NuevoGenNativoPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuevo Gen Nativo</h1>
        <p className="text-muted-foreground mt-1">
          Crea un nuevo invernadero de produccion
        </p>
      </div>
      
      <GenNativoForm />
    </div>
  );
}
