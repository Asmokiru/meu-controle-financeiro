-- ============================================================================
-- Migration: 20261026000100_enable_granular_rls
-- Descrição: Habilita Row Level Security (RLS) obrigatória e políticas
-- granulares (SELECT, INSERT, UPDATE, DELETE) para todas as tabelas com
-- dados de usuários e configura o bucket privado de comprovantes no Storage.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Garantir existência de todas as tabelas de dados de usuários com user_id NOT NULL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL UNIQUE,
    "estimated_monthly_income_cents" BIGINT NOT NULL DEFAULT 0,
    "encrypted_income_data" TEXT,
    "income_type" VARCHAR(20) NOT NULL DEFAULT 'FIXED',
    "fixed_monthly_expenses_cents" BIGINT NOT NULL DEFAULT 0,
    "budget_control_mode" VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(40) NOT NULL DEFAULT 'Mastercard',
    "last_four_digits" VARCHAR(4),
    "total_limit_cents" BIGINT NOT NULL,
    "closing_day" INTEGER NOT NULL CHECK ("closing_day" BETWEEN 1 AND 31),
    "due_day" INTEGER NOT NULL CHECK ("due_day" BETWEEN 1 AND 31),
    "alert_threshold_pct" INTEGER NOT NULL DEFAULT 80,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "userId" UUID GENERATED ALWAYS AS ("user_id") STORED,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_by_email" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "userId" UUID GENERATED ALWAYS AS ("user_id") STORED,
    "transaction_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(80) NOT NULL,
    "file_size_bytes" INTEGER NOT NULL CHECK ("file_size_bytes" > 0 AND "file_size_bytes" <= 5242880),
    "sha256_checksum" VARCHAR(64) NOT NULL,
    "storage_object_key" VARCHAR(500) NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "userId" UUID GENERATED ALWAYS AS ("user_id") STORED,
    "action" VARCHAR(80) NOT NULL,
    "resource_type" VARCHAR(80) NOT NULL,
    "resource_id" VARCHAR(120),
    "ip_address_masked" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(255) NOT NULL,
    "metadata_sanitized" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Habilitar e Forçar Row Level Security (RLS) em TODAS as tabelas
-- ============================================================================

ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profiles" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_profiles" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."accounts" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."cards" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."credit_cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."credit_cards" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."transactions" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."categories" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."budgets" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."goals" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."debts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."debts" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."notifications" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."attachments" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."audit_logs" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."users" FORCE ROW LEVEL SECURITY;

-- Revoga qualquer permissão de acesso anônimo (não autenticado)
REVOKE ALL ON public."profiles" FROM anon;
REVOKE ALL ON public."user_profiles" FROM anon;
REVOKE ALL ON public."accounts" FROM anon;
REVOKE ALL ON public."cards" FROM anon;
REVOKE ALL ON public."credit_cards" FROM anon;
REVOKE ALL ON public."transactions" FROM anon;
REVOKE ALL ON public."categories" FROM anon;
REVOKE ALL ON public."budgets" FROM anon;
REVOKE ALL ON public."goals" FROM anon;
REVOKE ALL ON public."debts" FROM anon;
REVOKE ALL ON public."notifications" FROM anon;
REVOKE ALL ON public."attachments" FROM anon;
REVOKE ALL ON public."audit_logs" FROM anon;
REVOKE ALL ON public."users" FROM anon;

-- ============================================================================
-- 3. Políticas Granulares RLS por Operação (SELECT, INSERT, UPDATE, DELETE)
-- Regra estrita: somente usuários autenticados (TO authenticated) e
-- exclusivamente para registros cujo user_id / "userId" seja igual a auth.uid().
-- ============================================================================

-- 3.1 Tabela: profiles
DROP POLICY IF EXISTS "Usuários visualizam somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários visualizam somente seu perfil"
ON public."profiles" FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários criam somente seu perfil"
ON public."profiles" FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários alteram somente seu perfil"
ON public."profiles" FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários excluem somente seu perfil"
ON public."profiles" FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3.1b Tabela equivalente Prisma: user_profiles
DROP POLICY IF EXISTS "user_isolated_profiles" ON public."user_profiles";
DROP POLICY IF EXISTS "Usuários visualizam somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários visualizam somente seu user_profile"
ON public."user_profiles" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários criam somente seu user_profile"
ON public."user_profiles" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários alteram somente seu user_profile"
ON public."user_profiles" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários excluem somente seu user_profile"
ON public."user_profiles" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.2 Tabela: accounts
DROP POLICY IF EXISTS "user_isolated_accounts" ON public."accounts";
DROP POLICY IF EXISTS "Usuários visualizam somente suas contas" ON public."accounts";
CREATE POLICY "Usuários visualizam somente suas contas"
ON public."accounts" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas contas" ON public."accounts";
CREATE POLICY "Usuários criam somente suas contas"
ON public."accounts" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas contas" ON public."accounts";
CREATE POLICY "Usuários alteram somente suas contas"
ON public."accounts" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas contas" ON public."accounts";
CREATE POLICY "Usuários excluem somente suas contas"
ON public."accounts" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.3 Tabela: cards
DROP POLICY IF EXISTS "Usuários visualizam somente seus cartões" ON public."cards";
CREATE POLICY "Usuários visualizam somente seus cartões"
ON public."cards" FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seus cartões" ON public."cards";
CREATE POLICY "Usuários criam somente seus cartões"
ON public."cards" FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seus cartões" ON public."cards";
CREATE POLICY "Usuários alteram somente seus cartões"
ON public."cards" FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seus cartões" ON public."cards";
CREATE POLICY "Usuários excluem somente seus cartões"
ON public."cards" FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3.3b Tabela equivalente Prisma: credit_cards
DROP POLICY IF EXISTS "user_isolated_credit_cards" ON public."credit_cards";
DROP POLICY IF EXISTS "Usuários visualizam somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários visualizam somente seus credit_cards"
ON public."credit_cards" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários criam somente seus credit_cards"
ON public."credit_cards" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários alteram somente seus credit_cards"
ON public."credit_cards" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários excluem somente seus credit_cards"
ON public."credit_cards" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.4 Tabela: transactions
DROP POLICY IF EXISTS "user_isolated_transactions" ON public."transactions";
DROP POLICY IF EXISTS "Usuários visualizam somente suas transações" ON public."transactions";
CREATE POLICY "Usuários visualizam somente suas transações"
ON public."transactions"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas transações" ON public."transactions";
CREATE POLICY "Usuários criam somente suas transações"
ON public."transactions"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas transações" ON public."transactions";
CREATE POLICY "Usuários alteram somente suas transações"
ON public."transactions"
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas transações" ON public."transactions";
CREATE POLICY "Usuários excluem somente suas transações"
ON public."transactions"
FOR DELETE
TO authenticated
USING ("userId" = auth.uid());

-- 3.5 Tabela: categories
DROP POLICY IF EXISTS "user_isolated_categories" ON public."categories";
DROP POLICY IF EXISTS "Usuários visualizam somente suas categorias" ON public."categories";
CREATE POLICY "Usuários visualizam somente suas categorias"
ON public."categories" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas categorias" ON public."categories";
CREATE POLICY "Usuários criam somente suas categorias"
ON public."categories" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas categorias" ON public."categories";
CREATE POLICY "Usuários alteram somente suas categorias"
ON public."categories" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas categorias" ON public."categories";
CREATE POLICY "Usuários excluem somente suas categorias"
ON public."categories" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.6 Tabela: budgets
DROP POLICY IF EXISTS "user_isolated_budgets" ON public."budgets";
DROP POLICY IF EXISTS "Usuários visualizam somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários visualizam somente seus orçamentos"
ON public."budgets" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários criam somente seus orçamentos"
ON public."budgets" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários alteram somente seus orçamentos"
ON public."budgets" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários excluem somente seus orçamentos"
ON public."budgets" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.7 Tabela: goals
DROP POLICY IF EXISTS "user_isolated_goals" ON public."goals";
DROP POLICY IF EXISTS "Usuários visualizam somente suas metas" ON public."goals";
CREATE POLICY "Usuários visualizam somente suas metas"
ON public."goals" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas metas" ON public."goals";
CREATE POLICY "Usuários criam somente suas metas"
ON public."goals" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas metas" ON public."goals";
CREATE POLICY "Usuários alteram somente suas metas"
ON public."goals" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas metas" ON public."goals";
CREATE POLICY "Usuários excluem somente suas metas"
ON public."goals" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.8 Tabela: debts
DROP POLICY IF EXISTS "user_isolated_debts" ON public."debts";
DROP POLICY IF EXISTS "Usuários visualizam somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários visualizam somente suas dívidas"
ON public."debts" FOR SELECT TO authenticated
USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários criam somente suas dívidas"
ON public."debts" FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários alteram somente suas dívidas"
ON public."debts" FOR UPDATE TO authenticated
USING ("userId" = auth.uid())
WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários excluem somente suas dívidas"
ON public."debts" FOR DELETE TO authenticated
USING ("userId" = auth.uid());

-- 3.9 Tabela: notifications
DROP POLICY IF EXISTS "Usuários visualizam somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários visualizam somente suas notificações"
ON public."notifications" FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários criam somente suas notificações"
ON public."notifications" FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários alteram somente suas notificações"
ON public."notifications" FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários excluem somente suas notificações"
ON public."notifications" FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3.10 Tabela: attachments
DROP POLICY IF EXISTS "Usuários visualizam somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários visualizam somente seus anexos"
ON public."attachments" FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários criam somente seus anexos"
ON public."attachments" FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários alteram somente seus anexos"
ON public."attachments" FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários excluem somente seus anexos"
ON public."attachments" FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3.11 Tabela: audit_logs
DROP POLICY IF EXISTS "Usuários visualizam somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários visualizam somente seus logs de auditoria"
ON public."audit_logs" FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários criam somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários criam somente seus logs de auditoria"
ON public."audit_logs" FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários alteram somente seus logs de auditoria"
ON public."audit_logs" FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários excluem somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários excluem somente seus logs de auditoria"
ON public."audit_logs" FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3.12 Tabela: users
DROP POLICY IF EXISTS "user_isolated_Select_own_user" ON public."users";
DROP POLICY IF EXISTS "Usuários visualizam somente seu próprio registro" ON public."users";
CREATE POLICY "Usuários visualizam somente seu próprio registro"
ON public."users" FOR SELECT TO authenticated
USING ("id" = auth.uid());

DROP POLICY IF EXISTS "Usuários alteram somente seu próprio registro" ON public."users";
CREATE POLICY "Usuários alteram somente seu próprio registro"
ON public."users" FOR UPDATE TO authenticated
USING ("id" = auth.uid())
WITH CHECK ("id" = auth.uid());

-- ============================================================================
-- 4. Bucket Privado do Supabase Storage para Comprovantes (mcf-private-attachments)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'mcf-private-attachments',
      'mcf-private-attachments',
      false,
      5242880,
      ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = false,
        file_size_limit = 5242880,
        allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Storage: usuários visualizam somente seus comprovantes" ON storage.objects';
    EXECUTE 'CREATE POLICY "Storage: usuários visualizam somente seus comprovantes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''mcf-private-attachments'' AND (storage.foldername(name))[2] = auth.uid()::text)';

    EXECUTE 'DROP POLICY IF EXISTS "Storage: usuários enviam somente seus comprovantes" ON storage.objects';
    EXECUTE 'CREATE POLICY "Storage: usuários enviam somente seus comprovantes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''mcf-private-attachments'' AND (storage.foldername(name))[2] = auth.uid()::text)';

    EXECUTE 'DROP POLICY IF EXISTS "Storage: usuários alteram somente seus comprovantes" ON storage.objects';
    EXECUTE 'CREATE POLICY "Storage: usuários alteram somente seus comprovantes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''mcf-private-attachments'' AND (storage.foldername(name))[2] = auth.uid()::text) WITH CHECK (bucket_id = ''mcf-private-attachments'' AND (storage.foldername(name))[2] = auth.uid()::text)';

    EXECUTE 'DROP POLICY IF EXISTS "Storage: usuários excluem somente seus comprovantes" ON storage.objects';
    EXECUTE 'CREATE POLICY "Storage: usuários excluem somente seus comprovantes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''mcf-private-attachments'' AND (storage.foldername(name))[2] = auth.uid()::text)';
  END IF;
END $$;
