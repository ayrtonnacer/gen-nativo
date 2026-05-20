import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!profile || profile.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { email, nombre, password, rol, gen_nativo_id } = body;

    // Validate required fields
    if (!email || !nombre || !password || !rol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (rol === 'operador' && !gen_nativo_id) {
      return NextResponse.json({ error: 'Los operadores deben tener un Gen Nativo asignado' }, { status: 400 });
    }

    // Create admin client with service role
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        nombre,
        rol,
        gen_nativo_id: rol === 'operador' ? gen_nativo_id : null,
        debe_cambiar_password: true, // Force password change on first login
        activo: true,
      });

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
