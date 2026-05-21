-- ============================================================
-- Gen Nativo — Schema v2
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE sector_tipo AS ENUM ('estanteria', 'cama', 'caballete', 'macrotunel', 'cancha');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE envase_tipo AS ENUM ('bandeja', 'maceta');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pedido_estado AS ENUM ('pendiente', 'entregado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Extender tabla lotes
-- ============================================================

ALTER TABLE lotes
  ADD COLUMN IF NOT EXISTS fecha_siembra date,
  ADD COLUMN IF NOT EXISTS cantidad_semillas_gramos numeric(10,2),
  ADD COLUMN IF NOT EXISTS cantidad_semillas_n integer;

-- Rellenar fecha_siembra con fecha_inicio para filas existentes
UPDATE lotes SET fecha_siembra = fecha_inicio::date WHERE fecha_siembra IS NULL;

-- 3. Tabla sectores
-- ============================================================

CREATE TABLE IF NOT EXISTS sectores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gen_nativo_id uuid NOT NULL REFERENCES gen_nativos(id) ON DELETE CASCADE,
  tipo sector_tipo NOT NULL,
  codigo text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gen_nativo_id, tipo, codigo)
);

-- 4. Tabla lote_ubicaciones (inventario vivo)
-- ============================================================

CREATE TABLE IF NOT EXISTS lote_ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  etapa text NOT NULL CHECK (etapa IN ('germinacion', 'repique', 'rusticacion')),
  sector_id uuid REFERENCES sectores(id) ON DELETE SET NULL,
  envase_tipo envase_tipo,
  cantidad integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  fecha_entrada date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Tabla movimientos (histórico de pases de etapa)
-- ============================================================

CREATE TABLE IF NOT EXISTS movimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  etapa_origen text NOT NULL,
  etapa_destino text NOT NULL,
  sector_origen_id uuid REFERENCES sectores(id) ON DELETE SET NULL,
  sector_destino_id uuid REFERENCES sectores(id) ON DELETE SET NULL,
  envase_tipo envase_tipo,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  perdidas integer NOT NULL DEFAULT 0 CHECK (perdidas >= 0),
  motivo_perdida text,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Tabla pedidos
-- ============================================================

CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gen_nativo_id uuid NOT NULL REFERENCES gen_nativos(id) ON DELETE CASCADE,
  destinatario text,
  fecha_creacion date NOT NULL DEFAULT CURRENT_DATE,
  fecha_entrega_prevista date,
  estado pedido_estado NOT NULL DEFAULT 'pendiente',
  notas text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Tabla pedido_items
-- ============================================================

CREATE TABLE IF NOT EXISTS pedido_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  lote_ubicacion_id uuid NOT NULL REFERENCES lote_ubicaciones(id) ON DELETE RESTRICT,
  especie_id uuid REFERENCES especies(id) ON DELETE SET NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Función updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER sectores_updated_at BEFORE UPDATE ON sectores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER lote_ubicaciones_updated_at BEFORE UPDATE ON lote_ubicaciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. RLS
-- ============================================================

ALTER TABLE sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lote_ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Helper: devuelve gen_nativo_id del usuario autenticado
CREATE OR REPLACE FUNCTION auth_gen_nativo_id()
RETURNS uuid AS $$
  SELECT gen_nativo_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: es admin
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS boolean AS $$
  SELECT rol = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- sectores
DROP POLICY IF EXISTS "sectores_select" ON sectores;
CREATE POLICY "sectores_select" ON sectores FOR SELECT
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "sectores_insert" ON sectores;
CREATE POLICY "sectores_insert" ON sectores FOR INSERT
  WITH CHECK (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "sectores_update" ON sectores;
CREATE POLICY "sectores_update" ON sectores FOR UPDATE
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "sectores_delete" ON sectores;
CREATE POLICY "sectores_delete" ON sectores FOR DELETE
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

-- lote_ubicaciones (acceso via lote -> gen_nativo)
DROP POLICY IF EXISTS "lote_ub_select" ON lote_ubicaciones;
CREATE POLICY "lote_ub_select" ON lote_ubicaciones FOR SELECT
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "lote_ub_insert" ON lote_ubicaciones;
CREATE POLICY "lote_ub_insert" ON lote_ubicaciones FOR INSERT
  WITH CHECK (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "lote_ub_update" ON lote_ubicaciones;
CREATE POLICY "lote_ub_update" ON lote_ubicaciones FOR UPDATE
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "lote_ub_delete" ON lote_ubicaciones;
CREATE POLICY "lote_ub_delete" ON lote_ubicaciones FOR DELETE
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

-- movimientos
DROP POLICY IF EXISTS "movimientos_select" ON movimientos;
CREATE POLICY "movimientos_select" ON movimientos FOR SELECT
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "movimientos_insert" ON movimientos;
CREATE POLICY "movimientos_insert" ON movimientos FOR INSERT
  WITH CHECK (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = lote_id AND l.gen_nativo_id = auth_gen_nativo_id()
    )
  );

-- pedidos
DROP POLICY IF EXISTS "pedidos_select" ON pedidos;
CREATE POLICY "pedidos_select" ON pedidos FOR SELECT
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "pedidos_insert" ON pedidos;
CREATE POLICY "pedidos_insert" ON pedidos FOR INSERT
  WITH CHECK (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "pedidos_update" ON pedidos;
CREATE POLICY "pedidos_update" ON pedidos FOR UPDATE
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

DROP POLICY IF EXISTS "pedidos_delete" ON pedidos;
CREATE POLICY "pedidos_delete" ON pedidos FOR DELETE
  USING (auth_is_admin() OR gen_nativo_id = auth_gen_nativo_id());

-- pedido_items (acceso via pedido -> gen_nativo)
DROP POLICY IF EXISTS "pedido_items_select" ON pedido_items;
CREATE POLICY "pedido_items_select" ON pedido_items FOR SELECT
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM pedidos p WHERE p.id = pedido_id AND p.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "pedido_items_insert" ON pedido_items;
CREATE POLICY "pedido_items_insert" ON pedido_items FOR INSERT
  WITH CHECK (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM pedidos p WHERE p.id = pedido_id AND p.gen_nativo_id = auth_gen_nativo_id()
    )
  );

DROP POLICY IF EXISTS "pedido_items_delete" ON pedido_items;
CREATE POLICY "pedido_items_delete" ON pedido_items FOR DELETE
  USING (
    auth_is_admin() OR
    EXISTS (
      SELECT 1 FROM pedidos p WHERE p.id = pedido_id AND p.gen_nativo_id = auth_gen_nativo_id()
    )
  );

-- 10. Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sectores_gen_nativo ON sectores (gen_nativo_id);
CREATE INDEX IF NOT EXISTS idx_lote_ub_lote ON lote_ubicaciones (lote_id);
CREATE INDEX IF NOT EXISTS idx_lote_ub_sector ON lote_ubicaciones (sector_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_lote ON movimientos (lote_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_gen_nativo ON pedidos (gen_nativo_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_ubicacion ON pedido_items (lote_ubicacion_id);
