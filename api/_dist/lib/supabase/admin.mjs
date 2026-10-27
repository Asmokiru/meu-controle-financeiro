// lib/supabase/admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

if (typeof window !== 'undefined') {
  throw new Error(
    'VIOLAÇÃO CRÍTICA DE SEGURANÇA: lib/supabase/admin.ts é exclusivo do servidor e jamais pode ser importado no navegador.'
  )
}

const serverSupabaseUrl = process.env.SUPABASE_URL || ''
// Suporta SUPABASE_SECRET_KEY (padrão recomendado) e SUPABASE_SERVICE_ROLE_KEY (compatibilidade temporária apenas no backend)
const serverSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

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

if (supabaseAdmin && supabaseAdmin.auth && !(supabaseAdmin.auth       ).options) {
  ;(supabaseAdmin.auth       ).options = {
    autoRefreshToken: false,
    persistSession: false
  }
}

export function isSupabaseAdminConfigured()          {
  return Boolean(
    serverSupabaseUrl &&
      serverSecretKey &&
      serverSupabaseUrl.startsWith('https://') &&
      !serverSupabaseUrl.includes('SEU_PROJETO') &&
      !serverSupabaseUrl.includes('[SEU-PROJECT-REF]') &&
      !serverSecretKey.includes('placeholder') &&
      !serverSecretKey.includes('substitua')
  )
}
