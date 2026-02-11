import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateUserRequest {
  email: string;
  password: string;
  nome_completo: string;
  tipo_usuario: 'admin_auxiliar' | 'representante_gt';
  estado_uf?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: usuarioData, error: usuarioError } = await supabaseClient
      .from('usuarios')
      .select('tipo_usuario')
      .eq('auth_user_id', user.id)
      .single();

    if (usuarioError || !usuarioData) {
      throw new Error('User profile not found');
    }

    if (usuarioData.tipo_usuario !== 'admin_geral') {
      throw new Error('Only admin_geral can create users');
    }

    const requestData: CreateUserRequest = await req.json();

    if (!requestData.email || !requestData.password || !requestData.nome_completo || !requestData.tipo_usuario) {
      throw new Error('Missing required fields');
    }

    if (requestData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (requestData.tipo_usuario === 'representante_gt' && !requestData.estado_uf) {
      throw new Error('Estado UF is required for representante_gt');
    }

    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    const insertData = {
      auth_user_id: authData.user.id,
      email: requestData.email,
      nome_completo: requestData.nome_completo,
      tipo_usuario: requestData.tipo_usuario,
      estado_uf: requestData.tipo_usuario === 'representante_gt' ? requestData.estado_uf : null,
      ativo: true,
    };

    const { data: insertedData, error: profileError } = await supabaseClient
      .from('usuarios')
      .insert(insertData)
      .select()
      .single();

    if (profileError) {
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Profile error: ${profileError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: insertedData,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});