// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const publicPublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_placeholder'

// Guarda de segurança em tempo de execução: jamais permitir que uma chave administrativa
// ou secret key seja passada ao cliente público do navegador.
if (
  publicPublishableKey.startsWith('sb_secret_') ||
  publicPublishableKey.toLowerCase().includes('service_role')
) {
  throw new Error(
    'VIOLAÇÃO CRÍTICA DE SEGURANÇA: Uma chave secreta administrativa foi detectada em NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
  )
}

export const supabase = createClient(
  publicSupabaseUrl,
  publicPublishableKey
)
