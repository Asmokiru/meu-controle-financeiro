// lib/supabase/admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

if (typeof window !== 'undefined') {
  throw new Error(
    'VIOLAÇÃO CRÍTICA DE SEGURANÇA: lib/supabase/admin.ts é exclusivo do servidor e jamais pode ser importado no navegador.'
  )
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'sb_secret_placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
